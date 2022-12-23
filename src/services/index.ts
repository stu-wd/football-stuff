import axios from 'axios';
import { RecordsSchema, Team, WinLoss } from '../models/my-league';

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

export const createAllPlayMap = (teams: Record<string, Team>) => {
  const count = Object.keys(teams).length;
  const allPlayMap: Record<string, any> = {};
  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    allPlayMap[rank] = { wins: count - rank, losses: i };
  }
  return allPlayMap;
};
