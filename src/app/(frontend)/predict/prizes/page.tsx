import { supabase } from '@/lib/supabase';
import type { Prize } from '@/types/contest';
import PrizeCard from '@/components/predict/PrizeCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PRIZE_NPR: Record<string, string> = {
  'Grand Champion': 'NPR 250,000',
  'Runner Up':      'NPR 150,000',
  'Third Place':    'NPR 75,000',
  'Weekly Winner':  'NPR 15,000',
  'Daily Winner':   'NPR 5,000',
  'Lucky Draw':     'Prize',
};

const TIMELINE = [
  { date: 'July 3, 2026', event: 'Group stage ends', detail: 'All group stage matches settled' },
  { date: 'July 7, 2026', event: 'Daily & Weekly prizes announced', detail: 'Final daily & weekly winners contacted by email' },
  { date: 'July 10, 2026', event: 'Overall winners announced', detail: 'Grand Champion, Runner Up, Third Place announced on all channels' },
  { date: 'July 15, 2026', event: 'Lucky Draw', detail: 'Top 50 participants enter the lucky draw at our Kathmandu office' },
  { date: 'July 20, 2026', event: 'Prize distribution', detail: 'Winners collect or receive prizes within 10 business days' },
];

const PRIZE_FAQS = [
  {
    q: 'How will I be notified if I win?',
    a: 'Winners are contacted via the email used to sign up. Please ensure your email is accessible.',
  },
  {
    q: 'Can I exchange the prize for cash?',
    a: 'Prizes cannot be exchanged for cash equivalents. The prizes are as described.',
  },
  {
    q: 'Is the scholarship consultation prize available everywhere?',
    a: 'Yes, but counselling sessions will be conducted in-person at our Kathmandu office or via video call.',
  },
  {
    q: 'What happens if a winner doesn\'t respond?',
    a: 'Winners have 14 days to respond after being notified. If no response, the prize moves to the next eligible player.',
  },
];

export default async function PrizesPage() {
  const { data: prizes } = await supabase
    .from('prizes')
    .select('*')
    .order('sort_order', { ascending: true });

  const prizeList = (prizes || []) as Prize[];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="text-center py-16 px-4 bg-gradient-to-b from-[#0a1628] to-[#0a0e1a]">
        <span className="text-5xl mb-4 block">🏆</span>
        <h1 className="text-4xl font-black text-white mb-3">Prizes</h1>
        <p className="text-[#9ca3af] max-w-xl mx-auto">
          Over <span className="text-[#fbbf24] font-semibold">NPR 5,00,000</span> in total prizes.
          Predict, earn points, and win big — absolutely free.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">

        {/* Prize cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {prizeList.map((prize, i) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
              featured={prize.tier === 'Grand Champion'}
              index={i}
            />
          ))}
        </div>

        {/* Prize value summary */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Prize breakdown</h2>
          <div className="bg-[#111827] rounded-2xl border border-[#1f2937] overflow-hidden">
            {prizeList.map((prize, i) => (
              <div
                key={prize.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < prizeList.length - 1 ? 'border-b border-[#1f2937]' : ''
                }`}
              >
                <div>
                  <p className="font-semibold text-white">{prize.title}</p>
                  <p className="text-xs text-[#6b7280]">{prize.tier}</p>
                </div>
                <span className="font-bold text-[#fbbf24]">
                  {PRIZE_NPR[prize.tier] || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Prize timeline</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[#1f2937]" />
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative flex gap-6 pl-10">
                  <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-[#111827] border-2 border-[#2563eb] flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
                  </div>
                  <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 flex-1">
                    <p className="text-xs text-[#2563eb] font-bold uppercase tracking-wider mb-1">{item.date}</p>
                    <p className="font-semibold text-white">{item.event}</p>
                    <p className="text-sm text-[#9ca3af] mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prize FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Prize FAQs</h2>
          <div className="bg-[#111827] rounded-2xl border border-[#1f2937] px-6 divide-y divide-[#1f2937]">
            {PRIZE_FAQS.map(faq => (
              <div key={faq.q} className="py-4">
                <p className="font-semibold text-white mb-1">{faq.q}</p>
                <p className="text-sm text-[#9ca3af]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-[#1e3a8a]/30 to-transparent rounded-2xl border border-[#1f2937] p-8">
          <h3 className="text-2xl font-bold text-white mb-3">Want to win these prizes?</h3>
          <p className="text-[#9ca3af] mb-6">Predict match scores before kickoff. It's free and takes 30 seconds to join.</p>
          <Link
            href="/predict/matches"
            className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 px-8 rounded-2xl transition-colors"
          >
            🏆 Start predicting now
          </Link>
        </div>
      </div>
    </div>
  );
}
