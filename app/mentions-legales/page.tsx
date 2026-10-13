import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBanner } from '@/components/CtaBanner';
import { emailHref, phoneHref, site } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Mentions légales',
  description:
    'Mentions légales de Netquoo, société de nettoyage à Montarnaud : éditeur, hébergeur, propriété intellectuelle, données personnelles (RGPD) et cookies.',
  path: '/mentions-legales',
});

/** Affiche la valeur si elle est renseignée, sinon un repère « [à compléter] ». */
function Field({ value, href }: { value: string; href?: string }) {
  if (!value) return <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[0.95em] font-medium text-brand-700">[à compléter]</span>;
  return href ? <a href={href}>{value}</a> : <>{value}</>;
}

const sections = [
  { id: 'editeur', label: 'Éditeur du site' },
  { id: 'publication', label: 'Directeur de la publication' },
  { id: 'hebergement', label: 'Hébergement' },
  { id: 'propriete-intellectuelle', label: 'Propriété intellectuelle' },
  { id: 'donnees-personnelles', label: 'Données personnelles' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'responsabilite', label: 'Responsabilité et liens' },
  { id: 'droit-applicable', label: 'Droit applicable' },
] as const;

export default function MentionsLegalesPage() {
  const address = `${site.address.postalCode} ${site.address.city}, France`;

  return (
    <>
      <section className="bg-mesh relative -mt-[72px] overflow-hidden pb-12 pt-[104px] md:pb-16 md:pt-[128px]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container relative">
          <Breadcrumbs items={[{ label: 'Mentions légales', href: '/mentions-legales' }]} />
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">Informations légales</span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.03em] md:text-6xl">Mentions légales</h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Conformément à la loi n°&nbsp;2004-575 du 21&nbsp;juin 2004 pour la confiance dans l’économie numérique
                (LCEN) et au Règlement général sur la protection des données (RGPD), voici les informations relatives à
                l’éditeur du site, à son hébergement et au traitement de vos données.
              </p>
            </div>
            <Link href="/devis" className="btn-primary shrink-0 self-start lg:self-auto">
              Demander un devis gratuit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-8 pt-12 md:pt-16">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Sommaire */}
          <aside className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-28">
              <nav aria-label="Sommaire des mentions légales" className="card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Sommaire</p>
                <ol className="mt-4 space-y-1">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                      >
                        <span className="text-xs font-bold text-brand-500">{String(i + 1).padStart(2, '0')}</span>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="card hidden bg-gradient-to-br from-brand-50 to-white p-6 lg:block">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <FileText className="h-5 w-5" />
                </span>
                <p className="mt-4 font-bold text-ink">Un projet de nettoyage ?</p>
                <p className="mt-1 text-sm text-slate-600">Devis gratuit et sans engagement, {site.quoteDelay}.</p>
                <Link href="/devis" className="btn-primary mt-5">
                  Devis gratuit <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Contenu */}
          <article className="prose-nq lg:col-span-8 [&_h2]:scroll-mt-28 [&_h2:first-child]:mt-0">
            <h2 id="editeur">1. Éditeur du site</h2>
            <p>
              Le présent site, accessible à l’adresse <a href={site.url}>{site.url.replace(/^https?:\/\//, '')}</a>, est édité
              par&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Raison sociale&nbsp;:</strong> {site.legalName}
              </li>
              <li>
                <strong>Forme juridique et capital social&nbsp;:</strong> <Field value="" />
              </li>
              <li>
                <strong>Siège social&nbsp;:</strong> <Field value={site.address.street} />, {address}
              </li>
              <li>
                <strong>SIRET&nbsp;:</strong> <Field value={site.siret} />
              </li>
              <li>
                <strong>Immatriculation (RCS / RNE)&nbsp;:</strong> <Field value="" />
              </li>
              <li>
                <strong>N° de TVA intracommunautaire&nbsp;:</strong> <Field value="" />
              </li>
              <li>
                <strong>Téléphone&nbsp;:</strong> <Field value={site.phone} href={phoneHref || undefined} />
              </li>
              <li>
                <strong>E-mail&nbsp;:</strong> <Field value={site.email} href={emailHref || undefined} />
              </li>
            </ul>

            <h2 id="publication">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication est <Field value={site.owner.fullName} />, en qualité de représentant légal de {site.legalName}.
            </p>

            <h2 id="hebergement">3. Hébergement</h2>
            <p>Le site est hébergé par&nbsp;:</p>
            <ul>
              <li>
                <strong>Vercel Inc.</strong>
              </li>
              <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
              <li>
                Site web&nbsp;: <a href="https://vercel.com" rel="noopener noreferrer" target="_blank">vercel.com</a>
              </li>
            </ul>

            <h2 id="propriete-intellectuelle">4. Propriété intellectuelle</h2>
            <p>
              L’ensemble des éléments composant ce site (structure, textes, logo, charte graphique, visuels, icônes, code
              source) est la propriété exclusive de {site.legalName} ou fait l’objet d’une autorisation d’utilisation. Ces
              éléments sont protégés par le Code de la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie de ces éléments,
              quel que soit le moyen ou le procédé utilisé, est interdite sans l’autorisation écrite préalable de{' '}
              {site.legalName}. Toute exploitation non autorisée est constitutive d’une contrefaçon sanctionnée par les
              articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>

            <h2 id="donnees-personnelles">5. Données personnelles (RGPD)</h2>
            <h3>Responsable du traitement</h3>
            <p>
              Le responsable du traitement des données collectées sur ce site est {site.legalName}, dont les coordonnées
              figurent à la rubrique «&nbsp;Éditeur du site&nbsp;».
            </p>

            <h3>Données collectées</h3>
            <p>
              Lorsque vous remplissez le <Link href="/devis">formulaire de demande de devis</Link>, nous collectons les
              informations que vous nous transmettez&nbsp;: nom et prénom, société, adresse e-mail, numéro de téléphone,
              commune et informations relatives à vos locaux et à votre besoin (type de locaux, surface, fréquence, message).
              Les champs obligatoires sont signalés dans le formulaire. Aucune donnée sensible n’est demandée.
            </p>

            <h3>Finalités et base légale</h3>
            <ul>
              <li>Répondre à votre demande de devis et vous recontacter à ce sujet (mesures précontractuelles prises à votre demande, art.&nbsp;6.1.b du RGPD)&nbsp;;</li>
              <li>Assurer le suivi de la relation commerciale si vous devenez client (exécution du contrat, art.&nbsp;6.1.b du RGPD)&nbsp;;</li>
              <li>Assurer la sécurité et le bon fonctionnement du site (intérêt légitime, art.&nbsp;6.1.f du RGPD).</li>
            </ul>
            <p>Vos données ne sont jamais vendues, louées ni utilisées à des fins de prospection par des tiers.</p>

            <h3>Destinataires</h3>
            <p>
              Les données sont destinées exclusivement à {site.legalName}. Elles peuvent être traitées, pour notre compte et
              selon nos instructions, par nos prestataires techniques (hébergement du site, service d’envoi d’e-mails),
              tenus à une obligation de confidentialité.
            </p>

            <h3>Transferts hors de l’Union européenne</h3>
            <p>
              Certains prestataires techniques, dont notre hébergeur Vercel Inc., sont situés aux États-Unis. Ces transferts
              sont encadrés par des garanties appropriées prévues par le RGPD (décision d’adéquation du cadre de protection
              des données UE–États-Unis et/ou clauses contractuelles types de la Commission européenne).
            </p>

            <h3>Durée de conservation</h3>
            <p>
              Les données liées à une demande de devis qui n’a pas donné lieu à une relation commerciale sont conservées au
              maximum <strong>3&nbsp;ans</strong> à compter de notre dernier échange. Les données des clients sont
              conservées pendant la durée de la relation contractuelle, puis archivées pendant les durées légales
              applicables (notamment comptables et fiscales).
            </p>

            <h3>Vos droits</h3>
            <p>
              Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de
              portabilité de vos données, ainsi que du droit de définir des directives relatives à leur sort après votre
              décès. Pour exercer ces droits, contactez-nous&nbsp;:
            </p>
            <ul>
              <li>
                par e-mail&nbsp;: <Field value={site.email} href={emailHref || undefined} />&nbsp;;
              </li>
              <li>
                par courrier&nbsp;: {site.legalName}, <Field value={site.address.street} />, {address}.
              </li>
            </ul>
            <p>
              Nous vous répondrons dans un délai d’un mois. Si vous estimez, après nous avoir contactés, que vos droits ne
              sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL&nbsp;:{' '}
              <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">www.cnil.fr</a>.
            </p>

            <h2 id="cookies">6. Cookies</h2>
            <p>
              <strong>Ce site n’utilise aucun cookie publicitaire ni traceur de ciblage</strong>, et ne revend aucune donnée
              de navigation.
            </p>
            <p>
              Seuls des cookies ou stockages strictement nécessaires au fonctionnement technique du site peuvent être
              utilisés. Conformément aux recommandations de la CNIL, ils sont exemptés de consentement. Si un outil de
              mesure d’audience venait à être mis en place, il serait configuré pour respecter votre vie privée ou soumis à
              votre consentement préalable, et la présente rubrique serait mise à jour.
            </p>

            <h2 id="responsabilite">7. Responsabilité et liens hypertextes</h2>
            <p>
              {site.legalName} s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur ce site,
              sans pouvoir garantir l’absence d’erreur ou d’omission. Les informations présentées ont une valeur
              indicative et ne constituent pas une offre contractuelle&nbsp;: seul le devis signé engage les parties.
            </p>
            <p>
              Le site peut contenir des liens vers des sites tiers. {site.legalName} n’exerce aucun contrôle sur ces sites
              et décline toute responsabilité quant à leur contenu.
            </p>

            <h2 id="droit-applicable">8. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution
              amiable, les tribunaux français seront seuls compétents.
            </p>

            <p className="!mt-10 text-sm text-slate-500">Dernière mise à jour&nbsp;: octobre 2026.</p>
          </article>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
