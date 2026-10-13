import { NextResponse } from 'next/server';
import { site } from '@/config/site';
import { communes } from '@/data/communes';
import { services } from '@/data/services';

// Envoi des demandes de devis par email via l'API Resend (https://resend.com/docs/api-reference/emails/send-email).
// Variables d'environnement : voir .env.example.
// ⚠️ Les valeurs acceptées (surface, fréquence, « autre », « plusieurs ») et les limites sont aussi
// définies dans src/components/QuoteForm.tsx : garder les deux fichiers synchronisés.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AUTRE_COMMUNE = 'autre';
const PLUSIEURS = 'plusieurs';
const MAX_BODY_BYTES = 20_000;

const LIMITS = { societe: 120, nom: 80, email: 160, telephone: 25, communeAutre: 80, message: 2000 } as const;

const SURFACES: Record<string, string> = {
  'moins-100': 'Moins de 100 m²',
  '100-300': '100 à 300 m²',
  '300-1000': '300 à 1 000 m²',
  'plus-1000': 'Plus de 1 000 m²',
};

const FREQUENCES: Record<string, string> = {
  ponctuelle: 'Ponctuelle',
  '1-semaine': '1 fois par semaine',
  '2-3-semaine': '2 à 3 fois par semaine',
  quotidienne: 'Quotidienne',
  'a-definir': 'À définir',
};

const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const PHONE_RE = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;

type Field =
  | 'prestation'
  | 'commune'
  | 'communeAutre'
  | 'surface'
  | 'frequence'
  | 'societe'
  | 'nom'
  | 'email'
  | 'telephone'
  | 'message'
  | 'consentement';

interface Devis {
  societe: string;
  nom: string;
  email: string;
  telephone: string;
  telephoneHref: string;
  /** Commune avec codes postaux et distance */
  commune: string;
  /** Nom seul de la commune (objet de l'email) */
  communeName: string;
  prestation: string;
  surface: string;
  frequence: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Utilitaires                                                        */
/* ------------------------------------------------------------------ */

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Nettoie une valeur texte : type, caractères de contrôle, espaces superflus. */
function clean(value: unknown, multiline = false): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  let s = value.normalize('NFC').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = multiline ? s.replace(/[ \t]+\n/g, '\n').replace(/\n{4,}/g, '\n\n\n') : s.replace(/\s+/g, ' ');
  return s.trim();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizePhone(v: string): string {
  return v.replace(/\(0\)/g, '').replace(/[\s.\-()]/g, '');
}

/** « +33612345678 » / « 0033 6… » / « 06.12… » → « 06 12 34 56 78 » */
function formatPhone(normalized: string): string {
  const national = normalized.replace(/^(?:\+|00)33/, '0');
  return national.replace(/(\d{2})(?=\d)/g, '$1 ');
}

function formatKm(km: number): string {
  return km.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}

/* ------------------------------------------------------------------ */
/*  Limitation de débit (au mieux : mémoire propre à chaque instance)  */
/* ------------------------------------------------------------------ */

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
  }
  return false;
}

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'inconnue';
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validate(body: Record<string, unknown>): { data: Devis } | { errors: Partial<Record<Field, string>> } {
  const errors: Partial<Record<Field, string>> = {};

  const prestationSlug = clean(body.prestation);
  const communeSlug = clean(body.commune);
  const communeAutre = clean(body.communeAutre);
  const surfaceKey = clean(body.surface);
  const frequenceKey = clean(body.frequence);
  const societe = clean(body.societe);
  const nom = clean(body.nom);
  const emailRaw = clean(body.email);
  const at = emailRaw.lastIndexOf('@');
  const email = at > 0 ? emailRaw.slice(0, at) + emailRaw.slice(at).toLowerCase() : emailRaw;
  const telephoneRaw = clean(body.telephone);
  const message = clean(body.message, true);

  // Prestation
  const service = services.find((s) => s.slug === prestationSlug);
  let prestation = '';
  if (service) prestation = service.title;
  else if (prestationSlug === PLUSIEURS) prestation = 'Plusieurs prestations';
  else errors.prestation = 'Choisissez le type de prestation souhaité.';

  // Commune
  let commune = '';
  let communeName = '';
  const c = communes.find((x) => x.slug === communeSlug);
  if (c) {
    commune = `${c.name} (${c.postalCodes.join(', ')})${c.distanceKm > 0 ? ` — à ${formatKm(c.distanceKm)} km de Montarnaud` : ''}`;
    communeName = c.name;
  } else if (communeSlug === AUTRE_COMMUNE) {
    if (communeAutre.length < 2) errors.communeAutre = 'Précisez le nom de votre commune.';
    else if (communeAutre.length > LIMITS.communeAutre) errors.communeAutre = `${LIMITS.communeAutre} caractères maximum.`;
    else {
      commune = `Autre commune (hors liste) : ${communeAutre}`;
      communeName = communeAutre;
    }
  } else {
    errors.commune = 'Indiquez la commune où se trouvent vos locaux.';
  }

  // Surface et fréquence (facultatives, mais limitées aux valeurs connues)
  let surface = 'Non précisée';
  if (surfaceKey) {
    if (SURFACES[surfaceKey]) surface = SURFACES[surfaceKey];
    else errors.surface = 'Surface non reconnue.';
  }
  let frequence = 'Non précisée';
  if (frequenceKey) {
    if (FREQUENCES[frequenceKey]) frequence = FREQUENCES[frequenceKey];
    else errors.frequence = 'Fréquence non reconnue.';
  }

  // Coordonnées
  if (societe.length < 2) errors.societe = 'Indiquez le nom de votre société.';
  else if (societe.length > LIMITS.societe) errors.societe = `${LIMITS.societe} caractères maximum.`;

  if (nom.length < 2) errors.nom = 'Indiquez votre nom et votre prénom.';
  else if (nom.length > LIMITS.nom) errors.nom = `${LIMITS.nom} caractères maximum.`;

  if (!email) errors.email = 'Indiquez votre adresse email.';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'Cette adresse email ne semble pas valide (ex. : nom@societe.fr).';

  const phone = normalizePhone(telephoneRaw);
  if (!telephoneRaw) errors.telephone = 'Indiquez un numéro de téléphone pour vous joindre.';
  else if (telephoneRaw.length > LIMITS.telephone || !PHONE_RE.test(phone))
    errors.telephone = 'Saisissez un numéro de téléphone français valide (ex. : 06 12 34 56 78).';

  if (message.length > LIMITS.message) errors.message = 'Votre message dépasse 2 000 caractères.';

  if (body.consentement !== true) errors.consentement = 'Merci d’accepter l’utilisation de vos informations pour que nous puissions vous répondre.';

  if (Object.keys(errors).length > 0) return { errors };

  const national = formatPhone(phone);
  return {
    data: {
      societe,
      nom,
      email,
      telephone: national,
      telephoneHref: `+33${national.replace(/\s/g, '').slice(1)}`,
      commune,
      communeName,
      prestation,
      surface,
      frequence,
      message,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Email                                                              */
/* ------------------------------------------------------------------ */

function buildEmail(d: Devis): { subject: string; html: string; text: string } {
  const receivedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date());
  const subject = `Demande de devis — ${d.societe} (${d.communeName})`.slice(0, 180);
  const replyHref = `mailto:${d.email}?subject=${encodeURIComponent(`Votre demande de devis ${site.name}`)}`;

  const rows: [string, string][] = [
    ['Société', escapeHtml(d.societe)],
    ['Contact', escapeHtml(d.nom)],
    ['Email', `<a href="${escapeHtml(replyHref)}" style="color:#1F4FEA;text-decoration:none;">${escapeHtml(d.email)}</a>`],
    ['Téléphone', `<a href="tel:${escapeHtml(d.telephoneHref)}" style="color:#1F4FEA;text-decoration:none;">${escapeHtml(d.telephone)}</a>`],
    ['Commune des locaux', escapeHtml(d.commune)],
    ['Prestation', escapeHtml(d.prestation)],
    ['Surface approximative', escapeHtml(d.surface)],
    ['Fréquence souhaitée', escapeHtml(d.frequence)],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:12px 16px 12px 0;border-bottom:1px solid #E6EDFB;color:#64748B;font-size:13px;width:38%;vertical-align:top;">${label}</td><td style="padding:12px 0;border-bottom:1px solid #E6EDFB;color:#0A1633;font-size:15px;font-weight:600;vertical-align:top;">${value}</td></tr>`,
    )
    .join('');

  const messageHtml = d.message
    ? `<tr><td style="padding:8px 32px 0;"><div style="color:#64748B;font-size:13px;margin:0 0 8px;">Message</div><div style="background:#F5F9FF;border:1px solid #DCE8FF;border-radius:14px;padding:16px;color:#0A1633;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(d.message)}</div></td></tr>`
    : '';

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF4FF;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DCE8FF;border-radius:20px;overflow:hidden;">
<tr><td style="background:#0B1A47;padding:28px 32px;">
<div style="color:#8AB2FF;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Nouvelle demande de devis</div>
<div style="color:#FFFFFF;font-size:24px;font-weight:800;line-height:1.25;margin-top:8px;">${escapeHtml(d.societe)}</div>
<div style="color:#B9D1FF;font-size:14px;margin-top:6px;">${escapeHtml(d.prestation)} · ${escapeHtml(d.communeName)}</div>
</td></tr>
<tr><td style="padding:12px 32px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table></td></tr>
${messageHtml}
<tr><td style="padding:28px 32px 32px;">
<a href="${escapeHtml(replyHref)}" style="display:inline-block;background:#1F4FEA;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:13px 24px;border-radius:999px;">Répondre à ${escapeHtml(d.nom)}</a>
<a href="tel:${escapeHtml(d.telephoneHref)}" style="display:inline-block;margin-left:8px;color:#1F4FEA;font-size:15px;font-weight:700;text-decoration:none;padding:13px 8px;">Appeler</a>
</td></tr>
</table>
<p style="color:#64748B;font-size:12px;line-height:1.5;margin:16px 0 0;">Demande reçue le ${escapeHtml(receivedAt)} via le formulaire ${escapeHtml(site.url)}/devis.<br>Le demandeur a accepté l’utilisation de ses informations pour le traitement de sa demande.</p>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `Nouvelle demande de devis — ${d.societe}`,
    '',
    `Société : ${d.societe}`,
    `Contact : ${d.nom}`,
    `Email : ${d.email}`,
    `Téléphone : ${d.telephone}`,
    `Commune des locaux : ${d.commune}`,
    `Prestation : ${d.prestation}`,
    `Surface approximative : ${d.surface}`,
    `Fréquence souhaitée : ${d.frequence}`,
    ...(d.message ? ['', 'Message :', d.message] : []),
    '',
    '—',
    `Demande reçue le ${receivedAt} via le formulaire ${site.url}/devis.`,
    'Le demandeur a accepté l’utilisation de ses informations pour le traitement de sa demande.',
  ].join('\n');

  return { subject, html, text };
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: 'payload_too_large' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'invalid_body' }, 400);
  const input = body as Record<string, unknown>;

  // Honeypot rempli → robot : on répond « OK » sans rien envoyer.
  if (typeof input.website === 'string' ? input.website.trim() !== '' : input.website != null) {
    return json({ ok: true });
  }

  const result = validate(input);
  if ('errors' in result) return json({ error: 'validation', fields: result.errors }, 400);

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.DEVIS_TO_EMAIL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || to.length === 0) {
    console.warn('[devis] RESEND_API_KEY ou DEVIS_TO_EMAIL manquant : bascule sur le mode secours côté navigateur.');
    return json({ error: 'not_configured', fallback: true }, 503);
  }

  if (isRateLimited(clientIp(request))) return json({ error: 'rate_limited' }, 429);

  const { subject, html, text } = buildEmail(result.data);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.DEVIS_FROM_EMAIL || 'Netquoo <onboarding@resend.dev>',
        to,
        reply_to: result.data.email,
        subject,
        html,
        text,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[devis] Échec de l'envoi Resend (${res.status}) : ${detail.slice(0, 500)}`);
      return json({ error: 'send_failed', fallback: true }, 502);
    }
  } catch (err) {
    console.error('[devis] Resend injoignable :', err instanceof Error ? err.message : err);
    return json({ error: 'send_failed', fallback: true }, 502);
  }

  return json({ ok: true });
}
