'use client';

interface ShareCardProps {
  displayName: string;
  rank: number | null;
  totalPoints: number;
  message?: string;
}

export default function ShareCard({ displayName, rank, totalPoints, message }: ShareCardProps) {
  const rankText = rank ? `#${rank}` : 'Top';
  const shareText = message ||
    `🏆 I'm ranked ${rankText} on Transit Education's FIFA World Cup 2026 Predict & Win contest with ${totalPoints} points! Think you can beat me? Join now 👉 transiteducation.com.np/predict`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Fallback: noop — browser may block clipboard without user gesture
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Preview card */}
      <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-xl p-4 border border-[#1f2937]">
        <p className="text-sm text-[#e2e8f0] leading-relaxed">{shareText}</p>
      </div>

      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1ebe57] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.858L.058 23.59a.5.5 0 00.614.614l5.77-1.464A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.956 0-3.784-.527-5.352-1.443l-.383-.228-3.974 1.009 1.025-3.877-.25-.396A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-[#9ca3af] hover:text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm"
          title="Copy link"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
