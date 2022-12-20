import { ReplOptions } from 'repl';

export interface TeamSchema {
  teamName: string;
  id: number | undefined;
  logo: string;
  records: RecordsSchema;
  schedule: Record<string, number>;
  weeklyRank: Record<string, number>;
  // weeklyDeviation: Record<string, number>;
}

export interface RecordsSchema {
  myWeekly: WinLoss;
  myMedian?: WinLoss;
  myCombined?: WinLoss;
  myCumulative?: Record<string, WinLoss>;
  myAllPlay?: Record<string, WinLoss>;
  pastOpponents?: RecordTypeSchema;
  futureOpponents?: RecordTypeSchema;
}

export interface RecordTypeSchema {
  weekly: WinLoss;
  median?: WinLoss;
  combined?: WinLoss;
}

export interface Matchup {
  teamId: number,
  score: number,
  opponentId: number
}

export interface WinLoss {
  wins: number;
  losses: number;
}

export interface TeamVariables {
    awayTeam: TeamSchema;
    homeTeam: TeamSchema;

    id: number;

  awayId: number;
  awayPoints: number;
  awayWins: number;
  awayLosses: number;
  awayPrevWins: number;
  awayPrevLosses: number;

  homeId: number;
  homePoints: number;
  homeWins: number;
  homeLosses: number;
  homePrevWins: number;
  homePrevLosses: number;

  awayFutureWins: number;
  awayFutureLosses: number;
  homeFutureWins: number;
  homeFutureLosses: number;

  homeMedianWins: number;
  homeMedianLosses: number;
  awayMedianLosses: number;
  awayMedianWins: number;

  matchupPeriodId: number;
}

// const createRecordObjects = (start: number, entries: number): Record<string, WinLoss> => {
//   const result: Record<string, WinLoss> = {};
//   for (let i = start; i < entries; i++) {
//     result[`${i}`] = { wins: 0, losses: 0 }
//   }
//   return result;
// }

// const createSchedule = () => {
//   const weeks = 14;
//   const schedule: Record<string, number> = {};

//   for (let week = 0; week < weeks; week++) {
//     const weekId = week + 1;
//     schedule[`${weekId}`] = 0;
//   }
//   return schedule;
// }

// export const TeamStarter: TeamSchema = {
//   teamName: '',
//   id: undefined,
//   logo: '',
//   schedule: createSchedule(),
//   // weeklyDeviation: {},
//   weeklyRank: {},
//   records: {
//     myWeekly: { wins: 0, losses: 0 },
//     myMedian: { wins: 0, losses: 0 },
//     myCombined: { wins: 0, losses: 0 },
//     myCumulative: createRecordObjects(0, 15),
//     myAllPlay: createRecordObjects(1, 15),
//     futureOpponents: {
//       weekly: { wins: 0, losses: 0 },
//       median: { wins: 0, losses: 0 },
//       combined: { wins: 0, losses: 0 },
//     },
//     pastOpponents: {
//       weekly: { wins: 0, losses: 0 },
//       median: { wins: 0, losses: 0 },
//       combined: { wins: 0, losses: 0 },
//     },
//   },
// };

export const createAllPlayMap = (teams: number) => {
  const allPlayMap: Record<string, any> = {}
  for (let i = 0; i < teams; i++) {
    const rank = i + 1;
    allPlayMap[rank] = { wins: teams - rank, losses: i };
  }
  return allPlayMap;
}

