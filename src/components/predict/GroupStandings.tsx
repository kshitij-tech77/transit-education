'use client';

import type { MatchWithPrediction } from '@/types/contest';

interface GroupStandingsProps {
  matches: MatchWithPrediction[];
  groupName: string;
}

interface TeamStats {
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export default function GroupStandings({ matches, groupName }: GroupStandingsProps) {
  const groupMatches = matches.filter(
    m => m.group_name === groupName && m.status === 'settled' && m.result !== null
  );

  if (groupMatches.length === 0) return null;

  // Build standings from settled matches
  const teamsMap = new Map<string, TeamStats>();

  const ensureTeam = (name: string, flag: string) => {
    if (!teamsMap.has(name)) {
      teamsMap.set(name, { name, flag, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
    }
    return teamsMap.get(name)!;
  };

  for (const m of groupMatches) {
    if (m.home_score === null || m.away_score === null || !m.result) continue;

    const home = ensureTeam(m.home_team, m.home_team_flag);
    const away = ensureTeam(m.away_team, m.away_team_flag);

    home.played++;
    away.played++;
    home.goalsFor += m.home_score;
    home.goalsAgainst += m.away_score;
    away.goalsFor += m.away_score;
    away.goalsAgainst += m.home_score;

    if (m.result === 'home') {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.result === 'away') {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }

  const standings = [...teamsMap.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  if (standings.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-[#1f2937]">
      <div className="bg-[#111827] px-3 py-2 flex items-center gap-2 border-b border-[#1f2937]">
        <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest">
          Group {groupName} — Standings
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[#6b7280] border-b border-[#1f2937]">
            <th className="text-left px-3 py-2 font-medium">Team</th>
            <th className="px-2 py-2 font-medium text-center">P</th>
            <th className="px-2 py-2 font-medium text-center">W</th>
            <th className="px-2 py-2 font-medium text-center">D</th>
            <th className="px-2 py-2 font-medium text-center">L</th>
            <th className="px-2 py-2 font-medium text-center">GD</th>
            <th className="px-2 py-2 font-medium text-center text-[#fbbf24]">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, i) => (
            <tr
              key={team.name}
              className={`border-b border-[#1f2937] last:border-0 ${
                i < 2 ? 'bg-[#0a1628]' : 'bg-[#0a0e1a]'
              }`}
            >
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-4 text-center font-bold ${i < 2 ? 'text-[#10b981]' : 'text-[#6b7280]'}`}>
                    {i + 1}
                  </span>
                  <span>{team.flag}</span>
                  <span className="font-medium text-white">{team.name}</span>
                </div>
              </td>
              <td className="px-2 py-2.5 text-center text-[#9ca3af]">{team.played}</td>
              <td className="px-2 py-2.5 text-center text-[#9ca3af]">{team.won}</td>
              <td className="px-2 py-2.5 text-center text-[#9ca3af]">{team.drawn}</td>
              <td className="px-2 py-2.5 text-center text-[#9ca3af]">{team.lost}</td>
              <td className="px-2 py-2.5 text-center text-[#9ca3af]">
                {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}
                {team.goalsFor - team.goalsAgainst}
              </td>
              <td className="px-2 py-2.5 text-center font-bold text-[#fbbf24]">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
