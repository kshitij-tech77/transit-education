'use client';

import { motion } from 'framer-motion';
import type { Prize } from '@/types/contest';
import { PRIZE_TIER_COLORS } from '@/types/contest';

const PRIZE_NPR: Record<string, string> = {
  'Grand Champion': 'NPR 250,000',
  'Runner Up':      'NPR 150,000',
  'Third Place':    'NPR 75,000',
  'Weekly Winner':  'NPR 15,000',
  'Daily Winner':   'NPR 5,000',
  'Lucky Draw':     'Prize',
};

const PRIZE_EMOJIS: Record<string, string> = {
  'Grand Champion': '💻',
  'Runner Up':      '📱',
  'Third Place':    '📱',
  'Weekly Winner':  '🔊',
  'Daily Winner':   '🎁',
  'Lucky Draw':     '🎲',
};

interface PrizeCardProps {
  prize: Prize;
  featured?: boolean;
  index?: number;
}

export default function PrizeCard({ prize, featured, index = 0 }: PrizeCardProps) {
  const color = PRIZE_TIER_COLORS[prize.tier] || '#9ca3af';
  const nprValue = PRIZE_NPR[prize.tier] || '';
  const emoji = PRIZE_EMOJIS[prize.tier] || '🏆';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`relative overflow-hidden rounded-2xl border bg-[#111827] flex flex-col ${
        featured
          ? 'border-[#fbbf24] shadow-lg shadow-yellow-900/20'
          : 'border-[#1f2937]'
      }`}
    >
      {/* Tier color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {prize.tier}
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">{prize.title}</h3>
          </div>
          <span className="text-4xl leading-none flex-shrink-0">{emoji}</span>
        </div>

        {prize.description && (
          <p className="text-sm text-[#9ca3af] leading-relaxed flex-1">{prize.description}</p>
        )}

        <div className="mt-auto">
          {nprValue && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280] uppercase tracking-wider">Prize Value</span>
              <span className="font-bold text-base" style={{ color }}>
                {nprValue}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Featured glow */}
      {featured && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ boxShadow: `inset 0 0 40px ${color}15` }} />
      )}
    </motion.div>
  );
}
