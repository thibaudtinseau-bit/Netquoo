'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  Layers,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MailCheck,
  MapPin,
  Pencil,
  Phone,
  Send,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { services, type ServiceIcon as ServiceIconName } from '@/data/services';
import { communes, type Commune } from '@/data/communes';

/* ------------------------------------------------------------------ */
/*  Options du formulaire                                              */
/*  ⚠️ Les valeurs (surface, fréquence, « autre », « plusieurs ») et   */
/*  les limites sont dupliquées dans app/api/devis/route.ts : garder   */
/*  les deux fichiers synchronisés.                                    */
/* ------------------------------------------------------------------ */

const AUTRE_COMMUNE = 'autre';
const PLUSIEURS = 'plusieurs';

const LIMITS = { societe: 120, nom: 80, email: 160, telephone: 25, communeAutre: 80, message: 2000 } as const;

const PRESTATIONS: { value: string; label: string; icon: ServiceIconName | null }[] = [
  ...services.map((s) => ({ value: s.slug, label: s.title, icon: s.icon })),
  { value: PLUSIEURS, label: 'Plusieurs prestations', icon: null },
];

const SURFACES = [
  { value: 'moins-100', label: 'Moins de 100 m²' },
  { value: '100-300', label: '100 à 300 m²' },
  { value: '300-1000', label: '300 à 1 000 m²' },
  { value: 'plus-1000', label: 'Plus de 1 000 m²' },
] as const;

const FREQUENCES = [
  { value: 'ponctuelle', label: 'Ponctuelle' },
  { value: '1-semaine', label: '1×/semaine' },
  { value: '2-3-semaine', label: '2-3×/semaine' },
  { value: 'quotidienne', label: 'Quotidienne' },
  { value: 'a-definir', label: 'À définir' },
] as const;

const SORTED_COMMUNES = [...communes].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
const COMMUNE_BY_SLUG = new Map(communes.map((c) => [c.slug, c]));
const PRESTATION_VALUES = new Set(PRESTATIONS.map((p) => p.value));

/* ------------------------------------------------------------------ */
/*  Types & validation                                                 */
/* ------------------------------------------------------------------ */

interface Values {
  prestation: string;
  commune: string;
  communeAutre: string;
  surface: string;
  frequence: string;
  societe: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
  consentement: boolean;
  /** Honeypot anti-spam : doit rester vide */
  website: string;
}

type FieldName = Exclude<keyof Values, 'website'>;
type Errors = Partial<Record<FieldName, string>>;

type Status =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'error'; message: string }
  | { type: 'mailto'; href: string };

interface ApiResponse {
  ok?: boolean;
  error?: string;
  fallback?: boolean;
  fields?: Record<string, string>;
}

const STEP1_FIELDS: FieldName[] = ['prestation', 'commune', 'communeAutre', 'surface', 'frequence'];
const STEP2_FIELDS: FieldName[] = ['societe', 'nom', 'email', 'telephone', 'message', 'consentement'];
const ALL_FIELDS = new Set<string>([...STEP1_FIELDS, ...STEP2_FIELDS]);

const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const PHONE_RE = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;

function normalizePhone(v: string): string {
  return v.replace(/\(0\)/g, '').replace(/[\s.\-()]/g, '');
}

function validateField(name: FieldName, v: Values): string | undefined {
  switch (name) {
    case 'prestation':
      return PRESTATION_VALUES.has(v.prestation) ? undefined : 'Choisissez le type de prestation souhaité.';
    case 'commune':
      return v.commune ? undefined : 'Indiquez la commune où se trouvent vos locaux.';
    case 'communeAutre': {
      if (v.commune !== AUTRE_COMMUNE) return undefined;
      const s = v.communeAutre.trim();
      if (s.length < 2) return 'Précisez le nom de votre commune.';
      return s.length > LIMITS.communeAutre ? `${LIMITS.communeAutre} caractères maximum.` : undefined;
    }
    case 'societe': {
      const s = v.societe.trim();
      if (s.length < 2) return 'Indiquez le nom de votre société.';
      return s.length > LIMITS.societe ? `${LIMITS.societe} caractères maximum.` : undefined;
    }
    case 'nom': {
      const s = v.nom.trim();
      if (s.length < 2) return 'Indiquez votre nom et votre prénom.';
      return s.length > LIMITS.nom ? `${LIMITS.nom} caractères maximum.` : undefined;
    }
    case 'email': {
      const s = v.email.trim();
      if (!s) return 'Indiquez votre adresse email.';
      if (s.length > LIMITS.email || !EMAIL_RE.test(s)) return 'Cette adresse email ne semble pas valide (ex. : nom@societe.fr).';
      return undefined;
    }
    case 'telephone': {
      const s = v.telephone.trim();
      if (!s) return 'Indiquez un numéro de téléphone pour vous joindre.';
      if (s.length > LIMITS.telephone || !PHONE_RE.test(normalizePhone(s)))
        return 'Saisissez un numéro de téléphone français valide (ex. : 06 12 34 56 78).';
      return undefined;
    }
    case 'message':
      return v.message.trim().length > LIMITS.message ? 'Votre message dépasse 2 000 caractères.' : undefined;
    case 'consentement':
      return v.consentement ? undefined : 'Merci d’accepter l’utilisation de vos informations pour que nous puissions vous répondre.';
    default:
      return undefined;
  }
}

function validateFields(fields: FieldName[], v: Values): Errors {
  const errs: Errors = {};
  for (const f of fields) {
    const msg = validateField(f, v);
    if (msg) errs[f] = msg;
  }
  return errs;
}

function firstError(errs: Errors, order: FieldName[]): FieldName | undefined {
  return order.find((f) => errs[f]);
}

function countErrors(errs: Errors): number {
  return Object.values(errs).filter(Boolean).length;
}

function initialValues(params: { get(name: string): string | null }): Values {
  const service = params.get('service') ?? '';
  const commune = params.get('commune') ?? '';
  return {
    prestation: PRESTATION_VALUES.has(service) ? service : '',
    commune: COMMUNE_BY_SLUG.has(commune) || commune === AUTRE_COMMUNE ? commune : '',
    communeAutre: '',
    surface: '',
    frequence: '',
    societe: '',
    nom: '',
    email: '',
    telephone: '',
    message: '',
    consentement: false,
    website: '',
  };
}

/* ------------------------------------------------------------------ */
/*  Libellés lisibles (récapitulatif, mailto)                          */
/* ------------------------------------------------------------------ */

function labelOf(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? '';
}

function communeLabel(v: Values): string {
  if (v.commune === AUTRE_COMMUNE) return v.communeAutre.trim() || 'Autre commune';
  return COMMUNE_BY_SLUG.get(v.commune)?.name ?? '';
}

function buildMailto(v: Values): string {
  const lines = [
    'Bonjour,',
    '',
    'Je souhaite recevoir un devis de nettoyage.',
    '',
    `Société : ${v.societe.trim()}`,
    `Contact : ${v.nom.trim()}`,
    `Email : ${v.email.trim()}`,
    `Téléphone : ${v.telephone.trim()}`,
    `Commune des locaux : ${communeLabel(v)}`,
    `Prestation : ${labelOf(PRESTATIONS, v.prestation)}`,
    `Surface approximative : ${labelOf(SURFACES, v.surface) || 'non précisée'}`,
    `Fréquence souhaitée : ${labelOf(FREQUENCES, v.frequence) || 'non précisée'}`,
  ];
  if (v.message.trim()) lines.push('', 'Message :', v.message.trim());
  lines.push('', 'Cordialement,', v.nom.trim());
  const subject = `Demande de devis — ${v.societe.trim()}`;
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function formatKm(km: number): string {
  return km.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Styles partagés                                                    */
/* ------------------------------------------------------------------ */

function inputClass(invalid: boolean, withIcon = true): string {
  return cx(
    'block w-full rounded-2xl border bg-white py-3.5 text-[16px] text-ink shadow-[0_1px_2px_rgba(10,22,51,0.04)] transition duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
    withIcon ? 'pl-11 pr-4' : 'px-4',
    invalid
      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-brand-500/20',
  );
}

const optionFocus = 'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/30';

/* ------------------------------------------------------------------ */
/*  Petits composants de champ                                         */
/* ------------------------------------------------------------------ */

function describedBy(id: string, error?: string, hint?: boolean): string | undefined {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}

function RequiredMark() {
  return (
    <span className="ml-0.5 text-brand-600" aria-hidden="true">
      *
    </span>
  );
}

function OptionalMark() {
  return <span className="ml-1.5 text-xs font-normal text-slate-400">(facultatif)</span>;
}

const labelClass = 'mb-2 block text-sm font-semibold text-ink';

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children}
      {required ? <RequiredMark /> : <OptionalMark />}
    </label>
  );
}

/** Légende visible d'un groupe de boutons radio (sert aussi de nom accessible au groupe). */
function GroupLegend({ id, required, children }: { id: string; required?: boolean; children: ReactNode }) {
  return (
    <legend id={id} className={labelClass}>
      {children}
      {required ? <RequiredMark /> : <OptionalMark />}
    </legend>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function InputIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true" />;
}

function StepPill({ n, label, state, onClick }: { n: number; label: string; state: 'current' | 'done' | 'todo'; onClick?: () => void }) {
  const inner = (
    <>
      <span
        className={cx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
          state === 'current' && 'bg-brand-600 text-white shadow-glow',
          state === 'done' && 'bg-brand-100 text-brand-700',
          state === 'todo' && 'border border-slate-200 bg-white text-slate-400',
        )}
      >
        {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : n}
      </span>
      <span className={cx('text-sm font-semibold', state === 'todo' ? 'text-slate-400' : 'text-ink')}>
        <span className="sr-only">Étape {n} : </span>
        {label}
        {state === 'done' && <span className="sr-only"> (terminée, modifier)</span>}
      </span>
    </>
  );
  return (
    <li className="shrink-0" aria-current={state === 'current' ? 'step' : undefined}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-2.5 rounded-full pr-2 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          {inner}
        </button>
      ) : (
        <div className="flex items-center gap-2.5 pr-2">{inner}</div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Formulaire                                                         */
/* ------------------------------------------------------------------ */

/**
 * Formulaire de demande de devis en 2 étapes.
 * Utilise `useSearchParams` (préremplissage `?service=<slug>&commune=<slug>`) :
 * la page qui l'affiche doit l'envelopper dans `<Suspense>`.
 */
export function QuoteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceParam = params.get('service');
  const communeParam = params.get('commune');

  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Values>(() => initialValues(params));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [announce, setAnnounce] = useState('');

  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<FieldName | 'heading' | null>(null);
  const stepChangedAt = useRef(0);

  // Si l'URL change alors que le formulaire est déjà affiché (navigation client), on reprend le préremplissage.
  useEffect(() => {
    if (serviceParam && PRESTATION_VALUES.has(serviceParam)) setValues((v) => ({ ...v, prestation: serviceParam }));
  }, [serviceParam]);
  useEffect(() => {
    if (communeParam && (COMMUNE_BY_SLUG.has(communeParam) || communeParam === AUTRE_COMMUNE))
      setValues((v) => ({ ...v, commune: communeParam }));
  }, [communeParam]);

  // Gestion du focus après rendu (changement d'étape, erreurs sur une étape masquée).
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === 'heading') {
      headingRef.current?.focus({ preventScroll: true });
      const top = topRef.current;
      if (top && top.getBoundingClientRect().top < 80) top.scrollIntoView({ block: 'start' });
    } else {
      fieldRefs.current[target]?.focus();
    }
  });

  const register = (name: FieldName) => (el: HTMLElement | null) => {
    fieldRefs.current[name] = el;
  };

  function update<K extends keyof Values>(name: K, value: Values[K]) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (name === 'website') return;
    const field = name as FieldName;
    if (errors[field] || (field === 'commune' && errors.communeAutre)) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, next),
        ...(field === 'commune' ? { communeAutre: validateField('communeAutre', next) } : {}),
      }));
    }
  }

  /** Validation douce à la sortie d'un champ déjà rempli (format email / téléphone, etc.). */
  function handleBlur(name: FieldName) {
    const raw = values[name];
    if (typeof raw === 'string' && raw.trim() === '') return;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }));
  }

  function goToStep(target: 1 | 2) {
    stepChangedAt.current = Date.now();
    setStep(target);
    setAnnounce(target === 1 ? 'Étape 1 sur 2 : votre besoin' : 'Étape 2 sur 2 : vos coordonnées');
    pendingFocus.current = 'heading';
  }

  function goNext() {
    const errs = validateFields(STEP1_FIELDS, values);
    setErrors((prev) => ({ ...prev, ...Object.fromEntries(STEP1_FIELDS.map((f) => [f, errs[f]])) }));
    const first = firstError(errs, STEP1_FIELDS);
    if (first) {
      const n = countErrors(errs);
      setAnnounce(n > 1 ? `${n} champs sont à compléter.` : 'Un champ est à compléter.');
      fieldRefs.current[first]?.focus();
      return;
    }
    goToStep(2);
  }

  function handleFallback() {
    if (site.email) {
      const href = buildMailto(values);
      setStatus({ type: 'mailto', href });
      window.location.href = href;
    } else {
      setStatus({
        type: 'error',
        message:
          'Notre formulaire en ligne est momentanément indisponible. Vos informations sont conservées sur cette page : merci de réessayer un peu plus tard.',
      });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.type === 'submitting') return;
    if (step === 1) {
      goNext();
      return;
    }
    // Évite qu'un double-clic sur « Continuer » n'envoie aussitôt l'étape 2.
    if (Date.now() - stepChangedAt.current < 400) return;

    const errs1 = validateFields(STEP1_FIELDS, values);
    const errs2 = validateFields(STEP2_FIELDS, values);
    const first1 = firstError(errs1, STEP1_FIELDS);
    if (first1) {
      setErrors({ ...errs1, ...errs2 });
      setStep(1);
      pendingFocus.current = first1;
      return;
    }
    const first2 = firstError(errs2, STEP2_FIELDS);
    if (first2) {
      setErrors(errs2);
      const n = countErrors(errs2);
      setAnnounce(n > 1 ? `${n} champs sont à corriger.` : 'Un champ est à corriger.');
      fieldRefs.current[first2]?.focus();
      return;
    }

    setErrors({});
    setStatus({ type: 'submitting' });

    const payload = {
      prestation: values.prestation,
      commune: values.commune,
      communeAutre: values.commune === AUTRE_COMMUNE ? values.communeAutre.trim() : '',
      surface: values.surface,
      frequence: values.frequence,
      societe: values.societe.trim(),
      nom: values.nom.trim(),
      email: values.email.trim(),
      telephone: values.telephone.trim(),
      message: values.message.trim(),
      consentement: values.consentement,
      website: values.website,
    };

    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (res.ok) {
        router.push('/devis/merci');
        return; // on garde l'état « envoi en cours » pendant la navigation
      }
      if (data?.fallback) {
        handleFallback();
        return;
      }
      if (res.status === 400 && data?.fields) {
        const serverErrs: Errors = {};
        for (const [k, msg] of Object.entries(data.fields)) if (ALL_FIELDS.has(k)) serverErrs[k as FieldName] = msg;
        setErrors(serverErrs);
        setStatus({ type: 'error', message: 'Certaines informations sont à vérifier avant l’envoi.' });
        const f1 = firstError(serverErrs, STEP1_FIELDS);
        if (f1) {
          setStep(1);
          pendingFocus.current = f1;
        } else {
          const f2 = firstError(serverErrs, STEP2_FIELDS);
          if (f2) pendingFocus.current = f2;
        }
        return;
      }
      if (res.status === 429) {
        setStatus({
          type: 'error',
          message: 'Plusieurs demandes ont été envoyées en peu de temps depuis votre connexion. Merci de patienter quelques minutes avant de réessayer.',
        });
        return;
      }
      setStatus({ type: 'error', message: 'Une erreur inattendue nous a empêchés d’envoyer votre demande. Merci de réessayer dans quelques instants.' });
    } catch {
      setStatus({ type: 'error', message: 'Impossible de joindre notre serveur. Vérifiez votre connexion internet, puis réessayez.' });
    }
  }

  const submitting = status.type === 'submitting';
  const selectedCommune: Commune | undefined = COMMUNE_BY_SLUG.get(values.commune);

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting} className="relative">
      <p className="sr-only" aria-live="polite" role="status">
        {announce}
      </p>

      {/* ---------- Indicateur d'étapes ---------- */}
      <div ref={topRef} className="scroll-mt-28">
        <ol className="flex items-center gap-3" aria-label="Étapes de votre demande">
          <StepPill n={1} label="Votre besoin" state={step === 1 ? 'current' : 'done'} onClick={step === 2 ? () => goToStep(1) : undefined} />
          <li aria-hidden="true" className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span className={cx('block h-full rounded-full bg-gradient-to-r from-brand-600 to-aqua transition-all duration-500', step === 2 ? 'w-full' : 'w-1/3')} />
          </li>
          <StepPill n={2} label="Vos coordonnées" state={step === 2 ? 'current' : 'todo'} />
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Étape {step} sur 2</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1.5 text-2xl font-bold outline-none md:text-[28px] md:leading-tight">
            {step === 1 ? 'Parlez-nous de vos locaux' : 'Où vous envoyer votre devis ?'}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          <RequiredMark /> champs obligatoires
        </p>
      </div>
      <p className="mt-2 text-[15px] text-slate-600">
        {step === 1
          ? 'Quelques clics suffisent pour cerner votre besoin. Vous pourrez tout préciser ensuite.'
          : `Un interlocuteur unique étudie votre demande et vous répond ${site.quoteDelay}.`}
      </p>

      {/* ---------- Étape 1 : le besoin ---------- */}
      <div hidden={step !== 1} className="mt-8 space-y-8">
        <fieldset
          role="radiogroup"
          aria-labelledby="prestation-label"
          aria-required="true"
          aria-invalid={errors.prestation ? true : undefined}
          aria-describedby={describedBy('prestation', errors.prestation)}
        >
          <GroupLegend id="prestation-label" required>
            Type de locaux / prestation
          </GroupLegend>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRESTATIONS.map((p, i) => {
              const checked = values.prestation === p.value;
              return (
                <label
                  key={p.value}
                  className={cx(
                    'relative flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl border p-3 pr-11 transition duration-150',
                    optionFocus,
                    checked
                      ? 'border-brand-500 bg-brand-50/80 shadow-soft'
                      : errors.prestation
                        ? 'border-red-300 bg-white hover:border-brand-300'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/30',
                    p.value === PLUSIEURS && 'sm:col-span-2',
                  )}
                >
                  <input
                    ref={i === 0 ? register('prestation') : undefined}
                    type="radio"
                    name="prestation"
                    value={p.value}
                    checked={checked}
                    onChange={() => update('prestation', p.value)}
                    className="sr-only"
                  />
                  <span
                    className={cx(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                      checked ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600',
                    )}
                    aria-hidden="true"
                  >
                    {p.icon ? <ServiceIcon name={p.icon} className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                  </span>
                  <span className="text-[15px] font-semibold leading-snug text-ink">{p.label}</span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute right-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border transition-colors',
                      checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white',
                    )}
                  >
                    {checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError id="prestation" message={errors.prestation} />
        </fieldset>

        <div>
          <FieldLabel htmlFor="commune" required>
            Commune de vos locaux
          </FieldLabel>
          <div className="relative">
            <InputIcon icon={MapPin} />
            <select
              id="commune"
              ref={register('commune')}
              name="commune"
              value={values.commune}
              onChange={(e) => update('commune', e.target.value)}
              aria-required="true"
              aria-invalid={errors.commune ? true : undefined}
              aria-describedby={describedBy('commune', errors.commune, true)}
              className={cx(inputClass(!!errors.commune), 'cursor-pointer appearance-none !pr-11', !values.commune && 'text-slate-400')}
            >
              <option value="" disabled>
                Sélectionnez votre commune
              </option>
              {SORTED_COMMUNES.map((c) => (
                <option key={c.slug} value={c.slug} className="text-ink">
                  {c.postalCodes.length === 1 ? `${c.name} (${c.postalCodes[0]})` : c.name}
                </option>
              ))}
              <option value={AUTRE_COMMUNE} className="text-ink">
                Autre commune
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          </div>
          <FieldError id="commune" message={errors.commune} />
          <div id="commune-hint" aria-live="polite">
            {selectedCommune ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} aria-hidden="true" />
                {selectedCommune.slug === 'montarnaud'
                  ? 'Montarnaud : c’est ici que Netquoo est basée.'
                  : `${selectedCommune.name} fait partie de notre zone d’intervention (à ${formatKm(selectedCommune.distanceKm)} km de Montarnaud).`}
              </p>
            ) : (
              values.commune === AUTRE_COMMUNE && (
                <p className="mt-3 text-sm text-slate-600">
                  Nous intervenons dans un rayon de {site.radiusKm} km autour de Montarnaud. Indiquez votre commune : nous vous dirons rapidement si
                  nous pouvons intervenir.
                </p>
              )
            )}
          </div>
        </div>

        {values.commune === AUTRE_COMMUNE && (
          <div>
            <FieldLabel htmlFor="communeAutre" required>
              Précisez votre commune
            </FieldLabel>
            <div className="relative">
              <InputIcon icon={MapPin} />
              <input
                id="communeAutre"
                ref={register('communeAutre')}
                name="communeAutre"
                type="text"
                autoComplete="address-level2"
                maxLength={LIMITS.communeAutre}
                placeholder="Ex. : nom de la commune"
                value={values.communeAutre}
                onChange={(e) => update('communeAutre', e.target.value)}
                onBlur={() => handleBlur('communeAutre')}
                aria-required="true"
                aria-invalid={errors.communeAutre ? true : undefined}
                aria-describedby={describedBy('communeAutre', errors.communeAutre)}
                className={inputClass(!!errors.communeAutre)}
              />
            </div>
            <FieldError id="communeAutre" message={errors.communeAutre} />
          </div>
        )}

        <fieldset role="radiogroup" aria-labelledby="surface-label">
          <GroupLegend id="surface-label">Surface approximative</GroupLegend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {SURFACES.map((o) => {
              const checked = values.surface === o.value;
              return (
                <label
                  key={o.value}
                  className={cx(
                    'relative flex min-h-[52px] cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition duration-150',
                    optionFocus,
                    checked
                      ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700',
                  )}
                >
                  <input
                    type="radio"
                    name="surface"
                    value={o.value}
                    checked={checked}
                    onChange={() => update('surface', o.value)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset role="radiogroup" aria-labelledby="frequence-label">
          <GroupLegend id="frequence-label">Fréquence souhaitée</GroupLegend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {FREQUENCES.map((o) => {
              const checked = values.frequence === o.value;
              return (
                <label
                  key={o.value}
                  className={cx(
                    'relative flex min-h-[52px] cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition duration-150',
                    optionFocus,
                    checked
                      ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700',
                  )}
                >
                  <input
                    type="radio"
                    name="frequence"
                    value={o.value}
                    checked={checked}
                    onChange={() => update('frequence', o.value)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* ---------- Étape 2 : les coordonnées ---------- */}
      <div hidden={step !== 2} className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-3 text-sm">
          <span className="sr-only">Récapitulatif de votre besoin :</span>
          {[labelOf(PRESTATIONS, values.prestation), communeLabel(values), labelOf(SURFACES, values.surface), labelOf(FREQUENCES, values.frequence)]
            .filter(Boolean)
            .map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1 font-medium text-brand-800 shadow-[0_1px_2px_rgba(10,22,51,0.06)]">
                {item}
              </span>
            ))}
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-semibold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier<span className="sr-only"> votre besoin</span>
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="societe" required>
              Société
            </FieldLabel>
            <div className="relative">
              <InputIcon icon={Building2} />
              <input
                id="societe"
                ref={register('societe')}
                name="societe"
                type="text"
                autoComplete="organization"
                maxLength={LIMITS.societe}
                placeholder="Nom de votre entreprise"
                value={values.societe}
                onChange={(e) => update('societe', e.target.value)}
                onBlur={() => handleBlur('societe')}
                aria-required="true"
                aria-invalid={errors.societe ? true : undefined}
                aria-describedby={describedBy('societe', errors.societe)}
                className={inputClass(!!errors.societe)}
              />
            </div>
            <FieldError id="societe" message={errors.societe} />
          </div>

          <div>
            <FieldLabel htmlFor="nom" required>
              Nom et prénom
            </FieldLabel>
            <div className="relative">
              <InputIcon icon={UserRound} />
              <input
                id="nom"
                ref={register('nom')}
                name="nom"
                type="text"
                autoComplete="name"
                maxLength={LIMITS.nom}
                placeholder="Prénom Nom"
                value={values.nom}
                onChange={(e) => update('nom', e.target.value)}
                onBlur={() => handleBlur('nom')}
                aria-required="true"
                aria-invalid={errors.nom ? true : undefined}
                aria-describedby={describedBy('nom', errors.nom)}
                className={inputClass(!!errors.nom)}
              />
            </div>
            <FieldError id="nom" message={errors.nom} />
          </div>

          <div>
            <FieldLabel htmlFor="email" required>
              Email professionnel
            </FieldLabel>
            <div className="relative">
              <InputIcon icon={Mail} />
              <input
                id="email"
                ref={register('email')}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={LIMITS.email}
                placeholder="nom@societe.fr"
                value={values.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-required="true"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy('email', errors.email)}
                className={inputClass(!!errors.email)}
              />
            </div>
            <FieldError id="email" message={errors.email} />
          </div>

          <div>
            <FieldLabel htmlFor="telephone" required>
              Téléphone
            </FieldLabel>
            <div className="relative">
              <InputIcon icon={Phone} />
              <input
                id="telephone"
                ref={register('telephone')}
                name="telephone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={LIMITS.telephone}
                placeholder="06 12 34 56 78"
                value={values.telephone}
                onChange={(e) => update('telephone', e.target.value)}
                onBlur={() => handleBlur('telephone')}
                aria-required="true"
                aria-invalid={errors.telephone ? true : undefined}
                aria-describedby={describedBy('telephone', errors.telephone)}
                className={inputClass(!!errors.telephone)}
              />
            </div>
            <FieldError id="telephone" message={errors.telephone} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="message">Votre message</FieldLabel>
          <textarea
            id="message"
            ref={register('message')}
            name="message"
            rows={5}
            maxLength={LIMITS.message}
            placeholder="Horaires souhaités, accès aux locaux, nombre de bureaux ou de sanitaires, contraintes particulières…"
            value={values.message}
            onChange={(e) => update('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy('message', errors.message, true)}
            className={cx(inputClass(!!errors.message, false), 'min-h-[132px] resize-y leading-relaxed')}
          />
          <div className="mt-1.5 flex justify-between gap-4">
            <FieldError id="message" message={errors.message} />
            <p id="message-hint" className="ml-auto mt-0.5 shrink-0 text-xs text-slate-400">
              {values.message.length} / 2 000 caractères
            </p>
          </div>
        </div>

        <div>
          <label
            className={cx(
              'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
              errors.consentement ? 'border-red-300 bg-red-50/30' : values.consentement ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-slate-50/60',
            )}
          >
            <input
              ref={register('consentement')}
              type="checkbox"
              name="consentement"
              checked={values.consentement}
              onChange={(e) => update('consentement', e.target.checked)}
              aria-required="true"
              aria-invalid={errors.consentement ? true : undefined}
              aria-describedby={describedBy('consentement', errors.consentement)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <span className="text-sm leading-relaxed text-slate-600">
              J’accepte que les informations saisies soient utilisées par {site.name} pour traiter ma demande de devis et me recontacter.{' '}
              <Link
                href="/mentions-legales"
                target="_blank"
                rel="noopener"
                className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600"
              >
                En savoir plus sur vos données<span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
              </Link>
              <RequiredMark />
            </span>
          </label>
          <FieldError id="consentement" message={errors.consentement} />
        </div>

        {/* Honeypot anti-spam : invisible pour les visiteurs, ignoré des lecteurs d'écran */}
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="website">Site web (ne pas remplir)</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>
      </div>

      {/* ---------- Messages d'état ---------- */}
      {status.type === 'error' && (
        <div role="alert" className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-semibold">Votre demande n’a pas pu être envoyée</p>
            <p className="mt-1 leading-relaxed">{status.message}</p>
            {phoneHref && (
              <p className="mt-2">
                Vous pouvez aussi nous appeler au{' '}
                <a href={phoneHref} className="font-semibold text-red-900 underline underline-offset-4">
                  {site.phone}
                </a>
                .
              </p>
            )}
          </div>
        </div>
      )}
      {status.type === 'mailto' && (
        <div role="status" className="mt-8 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
          <div>
            <p className="font-semibold">Votre messagerie s’ouvre avec votre demande préremplie</p>
            <p className="mt-1 leading-relaxed">
              Il ne vous reste qu’à envoyer l’email. Rien ne s’est ouvert ?{' '}
              <a href={status.href} className="font-semibold text-brand-700 underline underline-offset-4">
                Écrivez-nous à {site.email}
              </a>
              {phoneHref && (
                <>
                  {' '}
                  ou appelez-nous au{' '}
                  <a href={phoneHref} className="font-semibold text-brand-700 underline underline-offset-4">
                    {site.phone}
                  </a>
                </>
              )}
              .
            </p>
          </div>
        </div>
      )}

      {/* ---------- Navigation ---------- */}
      {step === 1 ? (
        <div className="mt-10 flex flex-col-reverse items-stretch gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center justify-center gap-2 text-sm text-slate-500 sm:justify-start">
            <LockKeyhole className="h-4 w-4 text-brand-500" aria-hidden="true" /> Gratuit et sans engagement
          </p>
          <button type="submit" className="btn-primary w-full !py-3.5 sm:w-auto sm:!px-8">
            Continuer <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-10 border-t border-slate-100 pt-6">
          <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => goToStep(1)}
              disabled={submitting}
              className="btn !px-4 text-slate-600 hover:bg-slate-50 hover:text-brand-700 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
            </button>
            <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5 disabled:cursor-wait disabled:opacity-80 sm:w-auto sm:!px-8">
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Envoi en cours…
                </>
              ) : (
                <>
                  Envoyer ma demande de devis <Send className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-slate-500 sm:justify-end sm:text-right">
            <LockKeyhole className="mt-px h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
            Vos informations servent uniquement à traiter votre demande de devis.
          </p>
        </div>
      )}
    </form>
  );
}
