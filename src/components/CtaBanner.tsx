import Link from 'next/link';
import { ArrowRight, Clock, Phone, ShieldCheck } from 'lucide-react';
import { phoneHref, site } from '@/config/site';

interface CtaBannerProps {
  title?: string;
  text?: string;
  /** Libellé du bouton principal */
  cta?: string;
  /** Lien du bouton principal (ex. /devis?commune=gignac) */
  href?: string;
}

/** Grand bandeau d'appel à l'action, à placer en bas de chaque page. */
export function CtaBanner({
  title = 'Des locaux impeccables, sans y penser.',
  text = `Décrivez-nous vos locaux : nous vous envoyons un devis clair et gratuit ${site.quoteDelay}, sans engagement.`,
  cta = 'Obtenir mon devis gratuit',
  href = '/devis',
}: CtaBannerProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="bg-navy relative overflow-hidden rounded-4xl px-6 py-14 text-center shadow-lift md:px-16 md:py-20">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white md:text-5xl">{title}</h2>
            <p className="mt-5 text-lg text-brand-100/90">{text}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={href} className="btn-white !px-8 !py-4 text-base">
                {cta} <ArrowRight className="h-4 w-4" />
              </Link>
              {phoneHref && (
                <a href={phoneHref} className="btn-ghost-light !px-8 !py-4 text-base">
                  <Phone className="h-4 w-4" /> {site.phone}
                </a>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-100/80">
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Réponse {site.quoteDelay}</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Sans engagement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Encart CTA compact, à insérer au milieu d'un contenu. */
export function CtaInline({ title, text, href = '/devis' }: { title: string; text?: string; href?: string }) {
  return (
    <div className="card my-10 flex flex-col items-start gap-5 bg-gradient-to-br from-brand-50 to-white p-7 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-lg font-bold text-ink">{title}</p>
        {text && <p className="mt-1 text-slate-600">{text}</p>}
      </div>
      <Link href={href} className="btn-primary shrink-0">
        Devis gratuit <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
