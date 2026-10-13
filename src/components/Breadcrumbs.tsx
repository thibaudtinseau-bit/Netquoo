import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from './JsonLd';
import { site } from '@/config/site';

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ label: 'Accueil', href: '/' }, ...items];
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.href} className="inline-flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              {i === all.length - 1 ? (
                <span className="font-medium text-ink" aria-current="page">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:text-brand-700">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label,
            item: `${site.url}${c.href === '/' ? '' : c.href}`,
          })),
        }}
      />
    </>
  );
}
