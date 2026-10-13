'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, Phone, X } from 'lucide-react';
import { Logo } from './Logo';
import { nav, phoneHref, site } from '@/config/site';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-brand-100/70 bg-white/80 backdrop-blur-xl' : 'bg-white/0'
      }`}
    >
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium transition-colors xl:px-4 ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {phoneHref && (
            <a href={phoneHref} className="hidden items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-ink hover:text-brand-700 xl:inline-flex">
              <Phone className="h-4 w-4 text-brand-600" /> {site.phone}
            </a>
          )}
          <Link href="/devis" className="btn-primary whitespace-nowrap !py-2.5">
            Devis gratuit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-100 bg-white text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-brand-100 bg-white lg:hidden">
          <nav className="container flex flex-col gap-1 py-4" aria-label="Navigation mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-base font-medium text-ink hover:bg-brand-50">
                {item.label}
              </Link>
            ))}
            <Link href="/devis" className="btn-primary mt-3">
              Demander un devis gratuit <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
