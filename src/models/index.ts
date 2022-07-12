export interface Player {
  defaultPositionId: number,
  eligibleSlots: number[],
  fullName: string,
  gamesPlayedByPosition: object,
  id: number,
  injuryStatus: string,
  proTeamId: number,
  starterStatusByProGame: object;
}

export interface Team {
  pitchers: Player[],
  hitters: Player[];
}

export interface Start {
  game: string,
  dayTime: string,
  away: string,
  home: string,
  UTC: string | undefined,
  gameId: string,
  jsDate: Date,
  count: number,
  numDayInWeek: number;
}

export interface StartsByPitcher {
  name: string,
  probStarts: Start[];
}

export interface MyStarts {
  startsByPitcher: StartsByPitcher[],
  startsByWeek: Start[][];
}

export class TableEntry {
  constructor(start) {
    this.game = start.game;
    this.dayTime = start.dayTime;
    this.home = start.home;
    this.away = start.away;
    this.count = start.count;
  }
  count: number;
  dayTime: string;
  home: string;
  away: string;
  game: string;
}

