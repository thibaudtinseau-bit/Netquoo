import Link from 'next/link';

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="nq-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3366FF" />
          <stop offset="1" stopColor="#162E79" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#nq-g)" />
      <path d="M12 28V12.5l16 15V12" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30.5 7.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#BFE3FF" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Netquoo — accueil">
      <LogoMark />
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        Net<span className={light ? 'text-brand-300' : 'text-brand-600'}>quoo</span>
      </span>
    </Link>
  );
}
