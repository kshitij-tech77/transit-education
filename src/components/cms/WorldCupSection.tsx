'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Match, ContestUser, LeaderboardEntry } from '@/types/contest';

type CmsTab = 'matches' | 'users' | 'leaderboard' | 'results';

// ── Result Entry Form ────────────────────────────────────────────────────────
function ResultEntry({
  match,
  onSettled,
}: {
  match: Match;
  onSettled: (matchId: string, homeScore: number, awayScore: number) => void;
}) {
  const [home, setHome] = useState(match.home_score ?? 0);
  const [away, setAway] = useState(match.away_score ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contest/admin/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': (document.cookie.match(/cms_session=([^;]+)/) || ['', ''])[1],
        },
        body: JSON.stringify({ match_id: match.id, home_score: home, away_score: away }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSettled(match.id, home, away);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set result');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">{match.home_team_flag} {match.home_team}</span>
      <input
        type="number"
        min={0}
        max={30}
        value={home}
        onChange={e => setHome(parseInt(e.target.value) || 0)}
        className="w-12 border rounded px-2 py-1 text-center text-sm"
      />
      <span className="text-gray-400">–</span>
      <input
        type="number"
        min={0}
        max={30}
        value={away}
        onChange={e => setAway(parseInt(e.target.value) || 0)}
        className="w-12 border rounded px-2 py-1 text-center text-sm"
      />
      <span className="text-sm text-gray-600">{match.away_team_flag} {match.away_team}</span>
      <button
        type="submit"
        disabled={submitting}
        className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50"
      >
        {submitting ? 'Saving…' : match.status === 'settled' ? 'Update result' : 'Set result'}
      </button>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WorldCupSection() {
  const [tab, setTab] = useState<CmsTab>('results');
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<ContestUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contest/matches');
      if (res.ok) {
        const d = await res.json();
        setMatches(d.matches || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Direct query using public API (only shows public fields)
      const res = await fetch('/api/contest/leaderboard?period=overall');
      if (res.ok) {
        const d = await res.json();
        setLeaderboard(d.entries || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'results' || tab === 'matches') loadMatches();
    if (tab === 'leaderboard' || tab === 'users') loadUsers();
  }, [tab, loadMatches, loadUsers]);

  const handleMatchSettled = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prev => prev.map(m =>
      m.id === matchId
        ? { ...m, home_score: homeScore, away_score: awayScore, status: 'settled' }
        : m
    ));
  };

  const TABS: { value: CmsTab; label: string }[] = [
    { value: 'results', label: '⚽ Enter Results' },
    { value: 'matches', label: '📅 All Matches' },
    { value: 'leaderboard', label: '🏆 Leaderboard' },
    { value: 'users', label: '👥 Participants' },
  ];

  const lockedOrOpen = matches.filter(m => m.status === 'locked' || m.status === 'open');
  const settledMatches = matches.filter(m => m.status === 'settled');

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <h2 className="font-bold text-gray-900">World Cup 2026 Contest</h2>
            <p className="text-xs text-gray-500">FIFA World Cup Predict & Win management</p>
          </div>
        </div>
        <div className="flex gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-gray-900">{matches.length}</p>
            <p className="text-[11px] text-gray-400">Matches</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">{lockedOrOpen.length}</p>
            <p className="text-[11px] text-gray-400">Open/Locked</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">{settledMatches.length}</p>
            <p className="text-[11px] text-gray-400">Settled</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-600">{leaderboard.length}</p>
            <p className="text-[11px] text-gray-400">Players</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Enter Results */}
            {tab === 'results' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Locked/Open — Ready for results ({lockedOrOpen.length})
                  </h3>
                  {lockedOrOpen.length === 0 ? (
                    <p className="text-sm text-gray-400">No matches waiting for results.</p>
                  ) : (
                    <div className="space-y-3">
                      {lockedOrOpen.map(m => (
                        <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-2">
                            Group {m.group_name} · Match {m.match_number} ·{' '}
                            {new Date(m.kickoff_at).toLocaleString()}
                          </div>
                          <ResultEntry match={m} onSettled={handleMatchSettled} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {settledMatches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      Settled — Edit results ({settledMatches.length})
                    </h3>
                    <div className="space-y-3">
                      {settledMatches.map(m => (
                        <div key={m.id} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                          <div className="text-xs text-gray-400 mb-2">
                            Group {m.group_name} · Match {m.match_number}
                          </div>
                          <ResultEntry match={m} onSettled={handleMatchSettled} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Matches */}
            {tab === 'matches' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b">
                      <th className="text-left py-2 pr-4">#</th>
                      <th className="text-left py-2 pr-4">Group</th>
                      <th className="text-left py-2 pr-4">Match</th>
                      <th className="text-left py-2 pr-4">Kickoff (UTC)</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {matches.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-4 text-gray-400">{m.match_number}</td>
                        <td className="py-2 pr-4 font-medium">{m.group_name}</td>
                        <td className="py-2 pr-4">
                          {m.home_team_flag} {m.home_team} vs {m.away_team_flag} {m.away_team}
                        </td>
                        <td className="py-2 pr-4 text-gray-500 text-xs">
                          {new Date(m.kickoff_at).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'open' ? 'bg-green-100 text-green-700' :
                            m.status === 'locked' ? 'bg-yellow-100 text-yellow-700' :
                            m.status === 'settled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-2 text-gray-700 font-mono">
                          {m.status === 'settled' && m.home_score !== null
                            ? `${m.home_score} – ${m.away_score}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leaderboard */}
            {tab === 'leaderboard' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b">
                        <th className="text-left py-2 pr-4">Rank</th>
                        <th className="text-left py-2 pr-4">Player</th>
                        <th className="text-left py-2 pr-4">City</th>
                        <th className="text-right py-2 pr-4">Predictions</th>
                        <th className="text-right py-2 pr-4">Correct</th>
                        <th className="text-right py-2 pr-4">Exact</th>
                        <th className="text-right py-2">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map((entry, i) => (
                        <tr key={entry.user_id} className="hover:bg-gray-50">
                          <td className="py-2 pr-4 font-bold text-gray-500">{entry.rank ?? i + 1}</td>
                          <td className="py-2 pr-4 font-medium">
                            {entry.contest_users?.display_name || entry.contest_users?.email || '—'}
                          </td>
                          <td className="py-2 pr-4 text-gray-500">{entry.contest_users?.city || '—'}</td>
                          <td className="py-2 pr-4 text-right">{entry.predictions_made}</td>
                          <td className="py-2 pr-4 text-right text-blue-600">{entry.correct_results}</td>
                          <td className="py-2 pr-4 text-right text-yellow-600">{entry.exact_scores}</td>
                          <td className="py-2 text-right font-bold text-gray-900">{entry.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Participants */}
            {tab === 'users' && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  {leaderboard.length} registered participants. All leads auto-sync to student pipeline.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b">
                        <th className="text-left py-2 pr-4">Name</th>
                        <th className="text-left py-2 pr-4">City</th>
                        <th className="text-right py-2 pr-4">Predictions</th>
                        <th className="text-right py-2">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map(entry => (
                        <tr key={entry.user_id} className="hover:bg-gray-50">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: entry.contest_users?.avatar_color || '#374151' }}
                              >
                                {(entry.contest_users?.display_name || 'A').slice(0, 1).toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {entry.contest_users?.display_name || entry.contest_users?.email || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-gray-500">{entry.contest_users?.city || '—'}</td>
                          <td className="py-2 pr-4 text-right">{entry.predictions_made}</td>
                          <td className="py-2 text-right font-bold">{entry.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
