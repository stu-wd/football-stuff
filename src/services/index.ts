import axios from 'axios';
import { RecordsSchema, TeamSchema, WinLoss } from '../models/my-league';

export const fetchUrl = async (url: string): Promise<any> => {
  try {
    const response = axios.get(url);
    const resolved = await Promise.resolve(response);
    return resolved;
  } catch (error) {
    throw new Error(error);
  }
};

export const checksIfTaxi = (value: string | number) => {
  switch (typeof value) {
    case 'string':
      return value === 'TAXI' || value === 'TM13';
    case 'number':
      const taxiIds = [11, 12, 13];
      return taxiIds.includes(value);
    default:
      break;
  }
};

export const createAllPlayMap = (teams: Record<string, TeamSchema>) => {
  const count = Object.keys(teams).length;
  const allPlayMap: Record<string, any> = {};
  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    allPlayMap[rank] = { wins: count - rank, losses: i };
  }
  return allPlayMap;
};

// const createEmptyWinLoss = (
//   start: number,
//   entries: number
// ): Record<string, WinLoss> => {
//   const result: Record<string, WinLoss> = {};
//   for (let i = start; i < entries; i++) {
//     result[`${i}`] = { wins: 0, losses: 0 };
//   }
//   return result;
// };

// export const initializeRecords = (): RecordsSchema => {
//   return {
//     myWeekly: { wins: 0, losses: 0 },
//     myMedian: { wins: 0, losses: 0 },
//     myCombined: { wins: 0, losses: 0 },
//     myCumulative: createEmptyWinLoss(0, 15),
//     myAllPlay: createEmptyWinLoss(1, 15),
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
//   };
// };

// export const createSchedule = (): Record<string, number> => {
//     const weeks = 14;
//     const schedule: Record<string, number> = {};

//     for (let week = 0; week < weeks; week++) {
//       const weekId = week + 1;
//       schedule[`${weekId}`] = 0;
//     }
//     return schedule;
//   }
