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