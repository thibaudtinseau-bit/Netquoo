import Image from 'next/image';
import Link from 'next/link';
import logoBlue from '../../public/brand/netquoo-logo-blue.png';
import logoWhite from '../../public/brand/netquoo-logo-white.png';

/** Logo officiel Netquoo (version bleue sur fond clair, blanche sur fond sombre). */
export function Logo({ light = false, className = 'h-11 w-auto' }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Netquoo Nettoyage — accueil">
      <Image src={light ? logoWhite : logoBlue} alt="Netquoo Nettoyage" className={className} priority={!light} sizes="160px" />
    </Link>
  );
}
