export interface EspnBoxscore {
  draftDetail: Record<string, boolean>;
  gameId: number;
  id: number;
  schedule: Record<string, any>[];
  scoringPeriodId: number;
  seasonId: number;
  segmentId: number;
  settings: Record<string, boolean | Object[]>;
  status: Record<string, boolean | number | string[] | Object[]>;
  teams: EspnTeam[];
}

export interface EspnTeam {
  abbrev: string;
  divisionId: number;
  id: number;
  location: string;
  logo: string;
  nickname: string;
  rankCalculatedFinal: number;
  record: { overall: EspnRecord };
}

export interface EspnRecord {
  wins: number;
  losses: number;
  ties: number;
}

export interface EspnMatchup {
  away: EspnAwayHome;
  home: EspnAwayHome;
  id: number;
  matchupPeriodId: number;
}

export interface EspnAwayHome {
  cumulativeScore: Record<string, any>;
  rosterForCurrentScoringPeriod: Record<string, any>;
  rosterForMatchupPeriod: Record<string, any>;
  rosterForMatchupPeriodDelayed: Record<string, any>;
  teamId: number;
  tiebreak: number;
  totalPoints: number;
}
