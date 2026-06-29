import { cn } from "@/lib/utils";

interface CountryContentProps {
  countryName: string;
  children?: React.ReactNode;
  className?: string;
}

export default function CountryContent({
  countryName,
  children,
  className,
}: CountryContentProps) {
  if (children) {
    return <div className={cn("", className)}>{children}</div>;
  }

  return (
    <div className={cn("py-16 flex flex-col items-center text-center", className)}>
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <svg
          className="w-7 h-7 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-black mb-2">
        {countryName} Compliance Guide
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
        Our counsellors are preparing detailed compliance information for{" "}
        {countryName}. In the meantime, contact us for personalised guidance.
      </p>
      <a
        href="/contact"
        className="mt-6 inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
      >
        Talk to a Counsellor
      </a>
    </div>
  );
}
