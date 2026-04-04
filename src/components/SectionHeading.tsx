export function SectionHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-px w-6 bg-[#f6821f]" />
      <h2 className="font-mono text-xs tracking-widest text-[#f6821f] uppercase">{title}</h2>
      {children}
    </div>
  );
}
