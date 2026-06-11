'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PointsBadgeProps {
  points: number;
  isExact?: boolean;
  isCorrect?: boolean;
  show: boolean;
}

export default function PointsBadge({ points, isExact, isCorrect, show }: PointsBadgeProps) {
  let bg = '#374151';
  let text = '#9ca3af';
  let label = '0 pts';

  if (isExact) {
    bg = '#064e3b';
    text = '#34d399';
    label = `+${points} pts ⚡ Exact!`;
  } else if (isCorrect) {
    bg = '#1e3a5f';
    text = '#60a5fa';
    label = `+${points} pts ✓`;
  } else if (points === 0 && (isExact !== undefined || isCorrect !== undefined)) {
    bg = '#450a0a';
    text = '#f87171';
    label = '0 pts ✗';
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: bg, color: text }}
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
