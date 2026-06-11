'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  locksAt: string;
  onExpire?: () => void;
  compact?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ locksAt, onExpire, compact }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(locksAt).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining(diff);
      if (diff === 0 && onExpire) onExpire();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locksAt, onExpire]);

  if (!mounted) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isUrgent = remaining < 60_000; // last 60 seconds
  const isVeryUrgent = remaining < 10_000; // last 10 seconds

  if (compact) {
    return (
      <motion.span
        animate={isVeryUrgent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className={`font-mono text-sm font-bold tabular-nums ${
          isUrgent ? 'text-[#ef4444]' : 'text-[#f59e0b]'
        }`}
      >
        {hours > 0 ? `${pad(hours)}:` : ''}{pad(minutes)}:{pad(seconds)}
      </motion.span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium uppercase tracking-wider ${isUrgent ? 'text-[#ef4444]' : 'text-[#9ca3af]'}`}>
        Locks in
      </span>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={totalSeconds}
          initial={{ opacity: 0, y: -4 }}
          animate={isVeryUrgent
            ? { opacity: 1, y: 0, scale: [1, 1.15, 1] }
            : { opacity: 1, y: 0 }
          }
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2, ...(isVeryUrgent ? { repeat: Infinity, duration: 0.5 } : {}) }}
          className={`font-mono font-bold tabular-nums ${
            isUrgent ? 'text-[#ef4444] text-base' : 'text-[#f59e0b] text-sm'
          }`}
        >
          {hours > 0 ? `${pad(hours)}:` : ''}{pad(minutes)}:{pad(seconds)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
