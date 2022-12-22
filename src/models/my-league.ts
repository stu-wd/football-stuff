import { ReplOptions } from 'repl';

export interface TeamSchema {
  teamName: string;
  id: number | undefined;
  logo: string;
  records: RecordsSchema;
  schedule: Record<string, number>;
  weeklyRank: Record<string, number>;
  weeklyRankAvg: number;
  // weeklyDeviation: Record<string, number>;
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
  opponentId: number;
}

export interface WinLoss {
  wins: number;
  losses: number;
}

// export interface TeamVariables {
//   awayTeam: TeamSchema;
//   homeTeam: TeamSchema;

//   id: number;

//   awayId: number;
//   awayPoints: number;
//   awayWins: number;
//   awayLosses: number;
//   awayPrevWins: number;
//   awayPrevLosses: number;

//   homeId: number;
//   homePoints: number;
//   homeWins: number;
//   homeLosses: number;
//   homePrevWins: number;
//   homePrevLosses: number;

//   awayFutureWins: number;
//   awayFutureLosses: number;
//   homeFutureWins: number;
//   homeFutureLosses: number;

//   homeMedianWins: number;
//   homeMedianLosses: number;
//   awayMedianLosses: number;
//   awayMedianWins: number;

//   matchupPeriodId: number;
// }
