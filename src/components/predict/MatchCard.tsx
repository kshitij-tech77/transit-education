'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from './CountdownTimer';
import PredictionForm from './PredictionForm';
import PointsBadge from './PointsBadge';
import type { MatchWithPrediction, Prediction } from '@/types/contest';

interface MatchCardProps {
  match: MatchWithPrediction;
  index?: number;
  onPredictionSaved?: (matchId: string, prediction: Prediction) => void;
}

// Confetti burst for correct predictions
function ConfettiBurst({ active }: { active: boolean }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 50),
    rotate: Math.random() * 720,
    color: ['#fbbf24', '#10b981', '#2563eb', '#8b5cf6'][i % 4],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {active && particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color, left: '50%', top: '60%' }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function toNPT(utcStr: string): string {
  const date = new Date(utcStr);
  // NPT = UTC+5:45
  const nptOffset = 5 * 60 + 45;
  const nptMs = date.getTime() + nptOffset * 60000;
  const npt = new Date(nptMs);
  return npt.toLocaleString('en-NP', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: true,
  }) + ' NPT';
}

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', bg: 'bg-[#1f2937]', text: 'text-[#9ca3af]', dot: '#6b7280' },
  open:     { label: 'Open',     bg: 'bg-[#064e3b]', text: 'text-[#34d399]', dot: '#10b981', pulse: true },
  locked:   { label: 'Locked',   bg: 'bg-[#451a03]', text: 'text-[#f59e0b]', dot: '#f59e0b' },
  settled:  { label: 'Settled',  bg: 'bg-[#1e3a5f]', text: 'text-[#60a5fa]', dot: '#2563eb' },
};

export default function MatchCard({ match, index = 0, onPredictionSaved }: MatchCardProps) {
  const [expanded, setExpanded] = useState(match.status === 'open');
  const [prediction, setPrediction] = useState(match.prediction);
  const [showConfetti, setShowConfetti] = useState(false);

  const status = STATUS_CONFIG[match.status];

  const handlePredictionSaved = useCallback((p: Prediction) => {
    setPrediction(p);
    onPredictionSaved?.(match.id, p);
  }, [match.id, onPredictionSaved]);

  // Show confetti when settled and prediction was correct
  const isCorrect = match.status === 'settled' && prediction?.is_correct_result;

  const handleExpand = () => setExpanded(e => !e);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="relative bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden hover:border-[#2563eb]/40 transition-colors"
    >
      <ConfettiBurst active={showConfetti} />

      {/* Card header */}
      <button
        type="button"
        onClick={handleExpand}
        className="w-full text-left"
      >
        <div className="px-4 pt-4 pb-3">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] bg-[#1f2937] px-2 py-0.5 rounded-full">
                Group {match.group_name} · Match {match.match_number}
              </span>
              <span
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
              >
                {(status as { pulse?: boolean }).pulse && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: status.dot }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: status.dot }} />
                  </span>
                )}
                {status.label}
              </span>
            </div>

            {match.status === 'open' && (
              <CountdownTimer locksAt={match.locks_at} compact />
            )}
          </div>

          {/* Teams */}
          <div className="flex items-center gap-3">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-3xl leading-none">{match.home_team_flag}</span>
              <span className="text-sm font-bold text-white text-center leading-tight">
                {match.home_team}
              </span>
              {match.status === 'settled' && match.home_score !== null && (
                <span className="text-2xl font-black text-white tabular-nums">{match.home_score}</span>
              )}
            </div>

            {/* Center */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              {match.status === 'settled' && match.home_score !== null && match.away_score !== null ? (
                <span className="text-[#6b7280] font-bold text-sm">–</span>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[#6b7280] text-xs font-medium">vs</span>
                  <span className="text-[10px] text-[#4b5563] mt-0.5">{toNPT(match.kickoff_at)}</span>
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-3xl leading-none">{match.away_team_flag}</span>
              <span className="text-sm font-bold text-white text-center leading-tight">
                {match.away_team}
              </span>
              {match.status === 'settled' && match.away_score !== null && (
                <span className="text-2xl font-black text-white tabular-nums">{match.away_score}</span>
              )}
            </div>
          </div>

          {/* Venue */}
          <p className="text-[11px] text-[#4b5563] text-center mt-2">
            {match.venue}, {match.city}
          </p>
        </div>
      </button>

      {/* Settled: show prediction result */}
      {match.status === 'settled' && prediction && (
        <div className={`px-4 pb-3 border-t border-[#1f2937] pt-3 ${isCorrect ? 'bg-[#064e3b]/30' : 'bg-[#1f0a0a]/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6b7280]">Your prediction</p>
              <p className="text-sm font-semibold text-white">
                {prediction.predicted_home_score} – {prediction.predicted_away_score}
                <span className="text-[#6b7280] ml-1.5 font-normal">
                  ({prediction.predicted_result === 'home' ? match.home_team : prediction.predicted_result === 'away' ? match.away_team : 'Draw'})
                </span>
              </p>
            </div>
            <PointsBadge
              points={prediction.points_earned}
              isExact={prediction.is_exact_score}
              isCorrect={prediction.is_correct_result}
              show
            />
          </div>
        </div>
      )}

      {/* Locked: show user prediction grayed */}
      {match.status === 'locked' && prediction && (
        <div className="px-4 pb-3 border-t border-[#1f2937] pt-3">
          <p className="text-xs text-[#6b7280]">
            Your prediction: <span className="text-[#9ca3af] font-medium">
              {prediction.predicted_home_score} – {prediction.predicted_away_score}
            </span>
            <span className="ml-1.5 text-[#f59e0b] text-[10px] font-medium">⏳ Waiting for result</span>
          </p>
        </div>
      )}

      {/* Expandable prediction form for open matches */}
      {match.status === 'open' && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[#1f2937]"
            >
              <div className="px-4 py-4">
                <PredictionForm
                  match={match}
                  existing={prediction}
                  onSaved={handlePredictionSaved}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Expand toggle for open matches when collapsed */}
      {match.status === 'open' && !expanded && (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={handleExpand}
            className="w-full py-2 rounded-xl bg-[#1f2937] hover:bg-[#2563eb] text-[#9ca3af] hover:text-white text-xs font-semibold transition-colors"
          >
            {prediction ? 'Update prediction' : '⚡ Predict this match'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
