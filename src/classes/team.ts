import { EspnTeam } from '../models/espn-api-responses';
import { RecordsSchema, WinLoss } from '../models/my-league';

export default class Team {
  public teamName: string;
  public id: number;
  public logo: string;

  public schedule: Record<string, number>;
  public records: RecordsSchema;
  public weeklyRank: Record<string, number>;

  constructor(team: EspnTeam) {
    const { id, location, logo, nickname, record } = team;
    const { losses, wins } = record.overall;

    this.teamName = [location, nickname].join(' ');
    this.id = id;
    this.logo = logo;

    this.records = this.initializeRecords();
    this.records.myWeekly = { wins, losses };

    this.schedule = this.initializeEmptyObject();
    this.weeklyRank = this.initializeEmptyObject();
  }

  private initializeRecords(): RecordsSchema {
    return {
      myWeekly: { wins: 0, losses: 0 },
      myMedian: { wins: 0, losses: 0 },
      myCombined: { wins: 0, losses: 0 },
      myAllPlayOverall: { wins: 0, losses: 0 },
      myCumulative: this.createEmptyWinLoss(0, 15),
      myAllPlayByWeek: this.createEmptyWinLoss(1, 15),
      futureOpponents: {
        weekly: { wins: 0, losses: 0 },
        median: { wins: 0, losses: 0 },
        combined: { wins: 0, losses: 0 },
      },
      pastOpponents: {
        weekly: { wins: 0, losses: 0 },
        median: { wins: 0, losses: 0 },
        combined: { wins: 0, losses: 0 },
      },
    };
  }

  private createEmptyWinLoss(
    start: number,
    total: number
  ): Record<string, WinLoss> {
    const result: Record<string, WinLoss> = {};
    for (let i = start; i < total; i++) {
      result[`${i}`] = { wins: 0, losses: 0 };
    }
    return result;
  }

  private initializeEmptyObject(): Record<string, number> {
    const weeks = 14;
    const schedule: Record<string, number> = {};

    for (let week = 0; week < weeks; week++) {
      const weekId = week + 1;
      schedule[`${weekId}`] = 0;
    }
    return schedule;
  }
}
