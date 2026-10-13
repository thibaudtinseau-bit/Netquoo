interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  text?: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}

export function SectionHeading({ eyebrow, title, text, align = 'center', as: Tag = 'h2' }: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Tag className="mt-4 text-3xl font-extrabold md:text-[44px] md:leading-[1.1]">{title}</Tag>
      {text && <p className="mt-5 text-lg leading-relaxed text-slate-600">{text}</p>}
    </div>
  );
}
