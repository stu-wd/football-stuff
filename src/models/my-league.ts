import { NumberUnitLength } from 'luxon';

export interface Team {
  teamName: string;
  id: number | undefined;
  logo: string;
  records: RecordsSchema;
  schedule: Record<string, number>;
  weeklyRank: Record<string, number>;
  weeklyRankAvg: number;
}

export interface RecordsSchema {
  myWeekly: WinLoss;
  myMedian: WinLoss;
  myCombined: WinLoss;
  myCumulative: Record<string, WinLoss>;
  myAllPlayOverall: WinLoss;
  myAllPlayByWeek: Record<string, WinLoss>;
  pastOpponents: RecordTypeSchema;
  futureOpponents: RecordTypeSchema;
}

export interface RecordTypeSchema {
  weekly: WinLoss;
  median?: WinLoss;
  combined?: WinLoss;
}

export interface Matchup {
  teamId: number;
  score: number;
  // opponentId: number;
}

export interface WinLoss {
  wins: number;
  losses: number;
}
