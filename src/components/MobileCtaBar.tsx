'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Phone } from 'lucide-react';
import { phoneHref } from '@/config/site';

/** Barre d'action collante en bas d'écran sur mobile (présente sur toutes les pages). */
export function MobileCtaBar() {
  const pathname = usePathname();
  // Inutile sur la page devis elle-même
  if (pathname.startsWith('/devis')) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/90 p-3 backdrop-blur-xl lg:hidden">
      <div className="flex gap-2">
        {phoneHref && (
          <a href={phoneHref} className="btn-outline flex-1 !px-4">
            <Phone className="h-4 w-4" /> Appeler
          </a>
        )}
        <Link href="/devis" className="btn-primary flex-[2] !px-4">
          <FileText className="h-4 w-4" /> Devis gratuit en 2 min
        </Link>
      </div>
    </div>
  );
}
