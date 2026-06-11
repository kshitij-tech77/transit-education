import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ContestProvider } from '@/components/predict/ContestProvider';
import AuthModal from '@/components/predict/AuthModal';
import PredictNav from '@/components/predict/PredictNav';

export const metadata: Metadata = {
  title: 'Predict & Win | FIFA World Cup 2026 | Transit Education',
  description:
    'Predict World Cup 2026 match scores, climb the leaderboard and win MacBook, iPhone and exclusive prizes. Free to play for Nepali students.',
  keywords: ['FIFA World Cup 2026', 'prediction contest', 'Nepal', 'student prizes', 'Transit Education'],
  alternates: { canonical: 'https://transiteducation.com.np/predict' },
  openGraph: {
    title: 'Predict & Win | FIFA World Cup 2026 | Transit Education',
    description: 'Predict match scores, earn points, win MacBook Air M3 + scholarship packages. Free for Nepali students.',
    url: 'https://transiteducation.com.np/predict',
    type: 'website',
    images: [
      {
        url: 'https://transiteducation.com.np/og-predict.png',
        width: 1200,
        height: 630,
        alt: 'Transit Education FIFA World Cup 2026 Predict & Win',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Predict & Win | FIFA World Cup 2026',
    description: 'Free prediction contest. Win MacBook Air M3 + scholarships. Join Transit Education.',
  },
};

export default function PredictLayout({ children }: { children: ReactNode }) {
  return (
    <ContestProvider>
      {/* Dark theme wrapper — isolates /predict from main site theme */}
      <div className="min-h-screen bg-[#0a0e1a] text-[#f9fafb] pb-20 md:pb-0">
        <PredictNav />
        {children}
      </div>
      <AuthModal />
    </ContestProvider>
  );
}
