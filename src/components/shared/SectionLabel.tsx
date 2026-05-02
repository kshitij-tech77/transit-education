export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-brand font-bold text-sm tracking-widest uppercase mb-4">
      {children}
    </div>
  );
}
