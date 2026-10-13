import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, House, MapPin, Sparkles, UserRound } from 'lucide-react';
import { CtaBanner } from '@/components/CtaBanner';
import { ServiceIcon } from '@/components/ServiceIcon';
import { services, servicePath } from '@/data/services';
import { communes } from '@/data/communes';

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page demandée n’existe pas ou a été déplacée. Retrouvez les services de nettoyage pour entreprises de Netquoo à Montarnaud.',
};

export default function NotFound() {
  return (
    <>
      <section className="bg-mesh relative -mt-[72px] overflow-hidden pb-16 pt-[120px] md:pb-24 md:pt-[160px]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <p
              aria-hidden="true"
              className="text-gradient select-none text-[7rem] font-extrabold leading-none tracking-[-0.06em] motion-safe:animate-fade-up sm:text-[10rem] md:text-[12rem]"
            >
              404
            </p>
            <span className="eyebrow mt-2 motion-safe:animate-fade-up motion-safe:[animation-delay:80ms]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Erreur 404 · Page introuvable
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.02em] motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] md:text-5xl">
              Cette page a été nettoyée… un peu trop bien.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600 motion-safe:animate-fade-up motion-safe:[animation-delay:240ms]">
              La page que vous cherchez n’existe pas ou a été déplacée. Pas d’inquiétude&nbsp;: voici de quoi retrouver
              votre chemin.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:320ms] sm:flex-row">
              <Link href="/" className="btn-primary !px-8 !py-4 text-base">
                <House className="h-4 w-4" /> Retour à l’accueil
              </Link>
              <Link href="/devis" className="btn-outline !px-8 !py-4 text-base">
                Demander un devis gratuit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:mt-20 md:grid-cols-3">
            <div className="card p-6 md:col-span-2 md:p-7">
              <h2 className="text-lg font-bold">Nos services de nettoyage</h2>
              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={servicePath(s)}
                      className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-brand-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                        <ServiceIcon name={s.icon} className="h-4 w-4" />
                      </span>
                      <span className="text-[15px] font-medium text-ink group-hover:text-brand-700">{s.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              <Link
                href="/zones-intervention"
                className="card group flex items-start gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="flex items-center gap-1 font-bold text-ink group-hover:text-brand-700">
                    Zones d’intervention <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{communes.length} communes autour de Montarnaud</span>
                </span>
              </Link>
              <Link
                href="/a-propos"
                className="card group flex items-start gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <UserRound className="h-5 w-5" />
                </span>
                <span>
                  <span className="flex items-center gap-1 font-bold text-ink group-hover:text-brand-700">
                    Pourquoi Netquoo <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">Nos engagements et notre méthode</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner title="Vous cherchiez une société de nettoyage ?" />
    </>
  );
}
