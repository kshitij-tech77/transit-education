'use client';

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export default function ScoreInput({ value, onChange, disabled, label }: ScoreInputProps) {
  const decrement = () => onChange(Math.max(0, value - 1));
  const increment = () => onChange(Math.min(20, value + 1));

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[11px] text-[#6b7280] uppercase tracking-wider font-medium">
          {label}
        </span>
      )}
      <div className="flex items-center gap-0">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || value <= 0}
          className="w-10 h-14 flex items-center justify-center bg-[#1f2937] hover:bg-[#374151] disabled:opacity-30 disabled:cursor-not-allowed text-[#9ca3af] hover:text-white transition-colors rounded-l-lg text-xl font-light select-none touch-manipulation"
          aria-label="Decrease score"
        >
          −
        </button>
        <div className="w-14 h-14 flex items-center justify-center bg-[#0a0e1a] border-y border-[#1f2937]">
          <span className="text-3xl font-bold text-white tabular-nums leading-none">
            {value}
          </span>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={disabled || value >= 20}
          className="w-10 h-14 flex items-center justify-center bg-[#1f2937] hover:bg-[#374151] disabled:opacity-30 disabled:cursor-not-allowed text-[#9ca3af] hover:text-white transition-colors rounded-r-lg text-xl font-light select-none touch-manipulation"
          aria-label="Increase score"
        >
          +
        </button>
      </div>
    </div>
  );
}
