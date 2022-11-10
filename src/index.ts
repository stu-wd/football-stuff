#!/usr/bin/env node

const dynastyId = 1692081466;

const otherLeagueId = 815545996;

const year = 2022;

const isDynastyLeague = true;

const cookies = {
  headers: {
    Cookie:
      'espn_s2=AECnbBBcvdqkEwDmjYB%2BFxxzk463CEVax6%2Bj9cI%2FD196rNUBLttf4oH7CxPYf70Y%2BuDB6ris55gb1CCng8hS%2FXjFzRMhU%2BtjwYOm0SsP6KpZtzyiROVpoQDG3AvBADWGZ%2FUPB9L%2FgmWRr3zgEl9y%2BvySp0tbcZAqM5C%2FAeW%2FIaKlpQM%2FEHuxCwSd7VXT0cXDkLMk%2Fmo9KW%2FJnLD5cwh1OMVofzkR176D%2BADCr7UqjHQNjYmfasSR4%2BrJfQ0KScKElRHDwN6MUfHtZXKwnWXarTYv; SWID={DEA1FB92-DABC-44DE-A1FB-92DABC74DE13};',
  },
};

const leagueUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${dynastyId}/`;

const boxscoreUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${dynastyId}/?view=mBoxscore`;

import { match } from 'assert';
// const url2 = 'https://fantasy.espn.com/football/boxscore?leagueId=1692081466&matchupPeriodId=1&scoringPeriodId=1&seasonId=2021&teamId=6&view=scoringperiod'

import axios from 'axios';

interface recordSchema {
  losses: number;
  wins: number;
}

interface teamSchema {
  name: string;
  id: number;
  record?: recordSchema;
  median?: recordSchema;
  overall?: recordSchema;
  opponents?: recordSchema;
  opponentsMedian?: recordSchema;
  opponentsRecordAtMatchup?: recordSchema;
  future?: recordSchema;
  futureMedian?: recordSchema;
  futureRecordAtMatchup?: recordSchema;
  points?: { for: number; against: number };
  recordByWeek?: Record<string, number[]>;
  matchupByWeek?: Record<
    string,
    {
      opponent: string;
      opponentId: number;
      for: number;
      against: number;
      result: string;
    }
  >;
}

const taxilessTeams: Record<string, teamSchema> = {};

const checksIfTaxi = (
  key: string,
  value: string | number,
  isDynastyLeague: boolean
) => {
  if (!isDynastyLeague) {
    return;
  }
  switch (key) {
    case 'abbrev':
      return value === 'TAXI' || value === 'TM13';
    case 'id':
      return value === 11 || value === 12 || value === 13;
    default:
      break;
  }
};

const populate = (id, name) => (taxilessTeams[`${id}`] = { name, id });

const fetchUrl = async (url: string): Promise<any> => {
  const response = axios.get(url, cookies);
  const resolved = await Promise.resolve(response);
  return resolved;
};

const response = await fetchUrl(leagueUrl);

const currentWeek = response.data.scoringPeriodId;

response.data.teams.map((team) => {
  const { abbrev, id, location, nickname } = team;

  if (!checksIfTaxi('abbrev', abbrev, isDynastyLeague)) {
    const name = location + ' ' + nickname;
    populate(id, name);
  }
});

const boxscore = await fetchUrl(boxscoreUrl);

boxscore.data.teams.map((team) => {
  const { abbrev, id, record } = team;
  const { wins, losses } = record.overall;
  if (!checksIfTaxi('abbrev', abbrev, isDynastyLeague)) {
    taxilessTeams[`${id}`] = {
      ...taxilessTeams[`${id}`],
      record: { wins, losses },
      median: { wins: 0, losses: 0 },
      overall: { wins: 0, losses: 0 },
      opponents: { wins: 0, losses: 0 },
      opponentsMedian: { wins: 0, losses: 0 },
      opponentsRecordAtMatchup: { wins: 0, losses: 0 },
      future: { wins: 0, losses: 0 },
      futureMedian: { wins: 0, losses: 0 },
      futureRecordAtMatchup: { wins: 0, losses: 0 },
      points: { for: 0, against: 0 },
      recordByWeek: {},
      matchupByWeek: {},
    };
  }
});

const scores: Record<string, { teamId: number; score: number }[]> = {};

[...Array(currentWeek).keys()].forEach((id: number) => {
  const week: number = id + 1;
  scores[`${week}`] = [];
});

boxscore.data.schedule.map((matchup) => {
  const { away, home, matchupPeriodId } = matchup;
  if (away && home && !checksIfTaxi('id', home.teamId, isDynastyLeague)) {
    if (matchupPeriodId < currentWeek) {
      const homePoints = home.totalPoints;
      const awayPoints = away.totalPoints;
      const awayId = away.teamId;
      const homeId = home.teamId;
      const awayTeam = taxilessTeams[`${awayId}`];
      const homeTeam = taxilessTeams[`${homeId}`];

      awayTeam.points.for += awayPoints;
      homeTeam.points.for += homePoints;

      awayTeam.points.against += homePoints;
      homeTeam.points.against += awayPoints;

      const isAwayVictory = awayPoints > homePoints;

      awayTeam.matchupByWeek[`${matchupPeriodId}`] = {
        opponent: homeTeam.name,
        opponentId: homeId,
        for: awayPoints,
        against: homePoints,
        result: isAwayVictory ? 'WIN' : 'LOSS',
      };
      homeTeam.matchupByWeek[`${matchupPeriodId}`] = {
        opponent: awayTeam.name,
        opponentId: awayId,
        for: homePoints,
        against: awayPoints,
        result: !isAwayVictory ? 'WIN' : 'LOSS',
      };

      const values = scores[`${matchupPeriodId}`];
      values.push(
        { teamId: awayId, score: awayPoints },
        { teamId: homeId, score: homePoints }
      );
    }
  }
});

[...Array(currentWeek).keys()].forEach((outerIndex: number) => {
  const weekId: number = outerIndex + 1;
  const values = scores[`${weekId}`];
  values.sort((a, b) => b.score - a.score);
  const half = values.length;
  values.forEach(
    (result: { teamId: number; score: number }, innerIndex: number) => {
      const rank = innerIndex + 1;
      const { teamId } = result;
      const team = taxilessTeams[`${teamId}`];
      // START HERE -- SOMETHING ABOUT THE MEDIAN STUFF
      if (rank <= 5) {
        team.median.wins += 1;
      } else team.median.losses += 1;

      const wins = team.record.wins;
      const losses = team.record.losses;
      const medianWins = team.median.wins;
      const medianLosses = team.median.losses;

      team.overall.wins = wins + medianWins;
      team.overall.losses = losses + medianLosses;
    }
  );
});

Object.keys(taxilessTeams).forEach((id) => {
  const team = taxilessTeams[id];
  [...Array(currentWeek).keys()].forEach((week: number) => {
    team.recordByWeek[`${week}`] = [0, 0];
  });
});

boxscore.data.schedule.map((matchup) => {
  const { away, home, matchupPeriodId } = matchup;
  if (away && home && !checksIfTaxi('id', home.teamId, isDynastyLeague)) {
    const awayId = String(away.teamId);
    const homeId = String(home.teamId);
    const awayTeam = taxilessTeams[awayId];
    const homeTeam = taxilessTeams[homeId];
    const awayWins = awayTeam.record.wins;
    const awayLosses = awayTeam.record.losses;
    const homeWins = homeTeam.record.wins;
    const homeLosses = homeTeam.record.losses;
    const awayPoints = away.totalPoints;
    const homePoints = home.totalPoints;

    const awayWinsMedian = awayTeam.median.wins;
    const awayLossesMedian = awayTeam.median.losses;
    const homeWinsMedian = homeTeam.median.wins;
    const homeLossesMedian = homeTeam.median.losses;

    if (matchupPeriodId < currentWeek) {
      const prevAwayW = awayTeam.recordByWeek[`${matchupPeriodId - 1}`][0];
      const prevAwayL = awayTeam.recordByWeek[`${matchupPeriodId - 1}`][1];

      const prevHomeW = homeTeam.recordByWeek[`${matchupPeriodId - 1}`][0];
      const prevHomeL = homeTeam.recordByWeek[`${matchupPeriodId - 1}`][1];

      if (awayPoints > homePoints) {
        awayTeam.recordByWeek[`${matchupPeriodId}`] = [
          prevAwayW + 1,
          prevAwayL,
        ];
        homeTeam.recordByWeek[`${matchupPeriodId}`] = [
          prevHomeW,
          prevHomeL + 1,
        ];
      } else {
        awayTeam.recordByWeek[`${matchupPeriodId}`] = [
          prevAwayW,
          prevAwayL + 1,
        ];
        homeTeam.recordByWeek[`${matchupPeriodId}`] = [
          prevHomeW + 1,
          prevHomeL,
        ];
      }

      awayTeam.opponentsRecordAtMatchup.wins += prevHomeW;
      awayTeam.opponentsRecordAtMatchup.losses += prevHomeL;
      homeTeam.opponentsRecordAtMatchup.wins += prevAwayW;
      homeTeam.opponentsRecordAtMatchup.losses += prevAwayL;

      awayTeam.opponents.wins += homeWins;
      awayTeam.opponents.losses += homeLosses;
      homeTeam.opponents.wins += awayWins;
      homeTeam.opponents.losses += awayLosses;

      awayTeam.opponentsMedian.wins += homeWinsMedian;
      awayTeam.opponentsMedian.losses += homeLossesMedian;
      homeTeam.opponentsMedian.wins += awayWinsMedian;
      homeTeam.opponentsMedian.losses += awayLossesMedian;
    } else {
      awayTeam.future.wins += homeWins;
      awayTeam.future.losses += homeLosses;
      homeTeam.future.wins += awayWins;
      homeTeam.future.losses += awayLosses;

      awayTeam.futureMedian.wins += homeWinsMedian;
      awayTeam.futureMedian.losses += homeLossesMedian;
      homeTeam.futureMedian.wins += awayWinsMedian;
      homeTeam.futureMedian.losses += awayLossesMedian;

      const futureOpponentId = matchup.away.teamId;
    const futureOpponent = taxilessTeams[`${futureOpponentId}`]

      console.log(matchupPeriodId, homeTeam.name, futureOpponent.name)
      const prevAwayW = awayTeam.recordByWeek[`${currentWeek - 1}`][0];
      const prevAwayL = awayTeam.recordByWeek[`${currentWeek - 1}`][1];

      const prevHomeW = homeTeam.recordByWeek[`${currentWeek - 1}`][0];
      const prevHomeL = homeTeam.recordByWeek[`${currentWeek - 1}`][1];
        awayTeam.futureRecordAtMatchup.wins += prevHomeW;
        awayTeam.futureRecordAtMatchup.losses += prevHomeL;
        homeTeam.futureRecordAtMatchup.wins += prevAwayW;
        homeTeam.futureRecordAtMatchup.losses += prevAwayL;
    }
  }
});

Object.keys(taxilessTeams).forEach((id) => {
  const team = taxilessTeams[id];
  console.log(team);
});

// console.log(taxilessTeams['1']);

// console.log(boxscore.data)
console.log('finished');
export {};
