import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  label: string;
  title: ReactNode;
  description: ReactNode;
};

export function SectionHeading({ id, label, title, description }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-brand">{label}</p>
      <h2
        id={id}
        className="mt-3 text-balance text-3xl font-semibold tracking-tight text-copy-primary sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-4 text-balance text-base leading-relaxed text-copy-secondary">
        {description}
      </p>
    </div>
  );
}
