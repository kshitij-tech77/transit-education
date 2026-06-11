'use client';

import { useState } from 'react';
import { useContest } from './ContestProvider';
import ScoreInput from './ScoreInput';
import type { Match, Prediction, MatchResult } from '@/types/contest';

interface PredictionFormProps {
  match: Match;
  existing?: Prediction | null;
  onSaved?: (prediction: Prediction) => void;
}

const RESULT_OPTIONS: { value: MatchResult; label: string }[] = [
  { value: 'home', label: 'Home Win' },
  { value: 'draw', label: 'Draw' },
  { value: 'away', label: 'Away Win' },
];

export default function PredictionForm({ match, existing, onSaved }: PredictionFormProps) {
  const { isAuthenticated, authModalOpen } = useContest();

  const [homeScore, setHomeScore] = useState(existing?.predicted_home_score ?? 0);
  const [awayScore, setAwayScore] = useState(existing?.predicted_away_score ?? 0);
  const [result, setResult] = useState<MatchResult | null>(existing?.predicted_result ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Auto-derive result from scores when scores change
  const deriveResult = (h: number, a: number): MatchResult => {
    if (h > a) return 'home';
    if (a > h) return 'away';
    return 'draw';
  };

  const handleHomeChange = (v: number) => {
    setHomeScore(v);
    setResult(deriveResult(v, awayScore));
  };

  const handleAwayChange = (v: number) => {
    setAwayScore(v);
    setResult(deriveResult(homeScore, v));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { authModalOpen(); return; }
    if (result === null) { setError('Please select a result'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contest/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: match.id,
          predicted_result: result,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save prediction');
      setSaved(true);
      onSaved?.(data.prediction);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = match.status !== 'open';

  return (
    <div className="flex flex-col gap-4">
      {/* Score inputs */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-white text-center max-w-[80px] truncate">
            {match.home_team_flag} {match.home_team}
          </span>
          <ScoreInput
            value={homeScore}
            onChange={handleHomeChange}
            disabled={isLocked || isSubmitting}
            label="Home"
          />
        </div>

        <div className="flex flex-col items-center gap-1 pb-6">
          <span className="text-[#6b7280] font-bold text-lg">vs</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-white text-center max-w-[80px] truncate">
            {match.away_team_flag} {match.away_team}
          </span>
          <ScoreInput
            value={awayScore}
            onChange={handleAwayChange}
            disabled={isLocked || isSubmitting}
            label="Away"
          />
        </div>
      </div>

      {/* Result selector */}
      <div className="flex gap-2">
        {RESULT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            disabled={isLocked || isSubmitting}
            onClick={() => setResult(opt.value)}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all disabled:opacity-50 ${
              result === opt.value
                ? 'bg-[#2563eb] border-[#2563eb] text-white'
                : 'bg-[#0a0e1a] border-[#1f2937] text-[#9ca3af] hover:border-[#374151] hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-[#ef4444] text-center">{error}</p>}

      {!isLocked && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || result === null}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-[#10b981] text-white'
              : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50'
          }`}
        >
          {isSubmitting
            ? 'Saving…'
            : saved
            ? '✓ Prediction saved!'
            : existing
            ? 'Update prediction'
            : isAuthenticated
            ? 'Save prediction'
            : 'Sign in to predict'}
        </button>
      )}
    </div>
  );
}
