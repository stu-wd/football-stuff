#!/usr/bin/env node

const leagueUrl = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/2022/segments/0/leagues/1692081466/';

const boxscoreUrl = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/2022/segments/0/leagues/1692081466/?view=mBoxscore'

import { match } from 'assert';
// const url2 = 'https://fantasy.espn.com/football/boxscore?leagueId=1692081466&matchupPeriodId=1&scoringPeriodId=1&seasonId=2021&teamId=6&view=scoringperiod'

import axios from 'axios';

interface recordSchema { losses: number, wins: number }

interface teamSchema { name: string, id: number, record?: recordSchema, median?: recordSchema, overall?: recordSchema, opponents?: recordSchema, opponentsMedian?: recordSchema, future?: recordSchema, futureMedian?: recordSchema, points?: { for: number, against: number, weeks: Record<string, { opponent: string, for: number, against: number, result: string }>}  };

let currentWeek: number = 0;

const taxilessTeams: Record<string, teamSchema> = {};

const checksIfTaxi = (key: string, value: string | number) => {
    switch (key) {
        case 'abbrev':
            return (value === 'TAXI' || value === 'TM13')
        case 'id':
            return (value === 11 || value === 12 || value === 13)
        default:
            break;
    }
}

const populate = (id, name) => taxilessTeams[`${id}`] = { name, id };

const fetchUrl = async (url: string): Promise<any> => {
    const response = axios.get(url);
    const resolved = await Promise.resolve(response);
    return resolved;
} 

const response = await fetchUrl(leagueUrl);

currentWeek = response.data.scoringPeriodId;

response.data.teams.map((team) => {
    const { abbrev, id, location, nickname } = team;
    
    if (!checksIfTaxi('abbrev', abbrev)) {
        const name = location + ' ' + nickname;
        populate(id, name)
    }
})

const boxscore = await fetchUrl(boxscoreUrl);

boxscore.data.teams.map((team) => {
    const { abbrev, id, record } = team;
    const { wins, losses } = record.overall;
    if (!checksIfTaxi('abbrev', abbrev)) {
        taxilessTeams[`${id}`] = {
            ...taxilessTeams[`${id}`],
            record: {wins, losses},
            median: { wins: 0, losses: 0 },
            overall: { wins: 0, losses: 0 },
            opponents: { wins: 0, losses: 0 },
            opponentsMedian: { wins: 0, losses: 0 },
            future: { wins: 0, losses: 0 },
            futureMedian: { wins: 0, losses: 0 },
            points: { for: 0, against: 0, weeks: {} }
        }
    }
});

const scores: Record<string, { teamId: number, score: number }[]> = {};

[...Array(currentWeek).keys()].forEach((id: number) => {
    const week: number = id + 1;
    scores[`${week}`] = [];
})

boxscore.data.schedule.map((matchup) => {
    const { away, home, matchupPeriodId } = matchup;
    if (away && home && !checksIfTaxi('id', home.teamId)) {
    

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
            
            let awayWeekRecap = awayTeam.points.weeks[`${matchupPeriodId}`];

            if (!awayWeekRecap) {
                awayWeekRecap = { opponent: '', for: 0, against: 0, result: ''}
            }

            let homeWeekRecap = awayTeam.points.weeks[`${matchupPeriodId}`];

            if (!homeWeekRecap) {
                homeWeekRecap = { opponent: '', for: 0, against: 0, result: ''}
            }

            
            
            awayWeekRecap.opponent = taxilessTeams[`${homeId}`].name;
            homeWeekRecap.opponent = taxilessTeams[`${awayId}`].name;
            awayWeekRecap.for += awayPoints;
            awayWeekRecap.against += homePoints;
            homeWeekRecap.for += homePoints;
            homeWeekRecap.against += awayPoints;



            const determineResult = (total: number): string => {
                return total > 0 ? 'WIN' : 'LOSS';
            }
            
            console.log({awayWeekRecap}, {homeWeekRecap});

            awayTeam.points.weeks[`${matchupPeriodId}`] = awayWeekRecap;
            homeTeam.points.weeks[`${matchupPeriodId}`] = homeWeekRecap;
            const values = scores[`${matchupPeriodId}`];
            values.push({teamId: awayId, score: awayPoints}, {teamId: homeId, score: homePoints})
        }
    }
});

[...Array(currentWeek).keys()].forEach((week: number) => {
    const weekId: number = week + 1;
    const values = scores[`${weekId}`];
    values.sort((a, b) => b.score - a.score);
    values.forEach((result: { teamId: number, score: number }, index: number) => {
        const rank = index + 1;
        const { teamId } = result;
        const team = taxilessTeams[`${teamId}`]
        if (rank <= 5) {
            team.median.wins += 1
        } else team.median.losses += 1

        const wins = team.record.wins;
        const losses = team.record.losses;
        const medianWins = team.median.wins;
        const medianLosses = team.median.losses;

        team.overall.wins = wins + medianWins;
        team.overall.losses = losses + medianLosses;
    })
});

Object.keys(taxilessTeams).forEach((id) => {
    const team = taxilessTeams[id]
});

boxscore.data.schedule.map((matchup) => {
    const { away, home, matchupPeriodId } = matchup;
    if (away && home && !checksIfTaxi('id', home.teamId)) {
        if (matchupPeriodId < currentWeek) {
            const awayId = String(away.teamId);
            const homeId = String(home.teamId);
            const awayTeam = taxilessTeams[awayId];
            const homeTeam = taxilessTeams[homeId];
            const awayWins = awayTeam.record.wins;
            const awayLosses = awayTeam.record.losses;
            const homeWins = homeTeam.record.wins;
            const homeLosses = homeTeam.record.losses;

            awayTeam.opponents.wins += homeWins           
            awayTeam.opponents.losses += homeLosses;            
            homeTeam.opponents.wins += awayWins;            
            homeTeam.opponents.losses += awayLosses;   
            
            const awayWinsMedian = awayTeam.overall.wins;
            const awayLossesMedian = awayTeam.overall.losses;
            const homeWinsMedian = homeTeam.overall.wins;
            const homeLossesMedian = homeTeam.overall.losses;

            awayTeam.opponentsMedian.wins += homeWinsMedian           
            awayTeam.opponentsMedian.losses += homeLossesMedian;            
            homeTeam.opponentsMedian.wins += awayWinsMedian;            
            homeTeam.opponentsMedian.losses += awayLossesMedian;            
        } else {
            const awayId = String(away.teamId);
            const homeId = String(home.teamId);
            const awayTeam = taxilessTeams[awayId];
            const homeTeam = taxilessTeams[homeId];
            const awayWins = awayTeam.record.wins;
            const awayLosses = awayTeam.record.losses;
            const homeWins = homeTeam.record.wins;
            const homeLosses = homeTeam.record.losses;

            awayTeam.future.wins += homeWins           
            awayTeam.future.losses += homeLosses;            
            homeTeam.future.wins += awayWins;            
            homeTeam.future.losses += awayLosses;

            const awayWinsMedian = awayTeam.overall.wins;
            const awayLossesMedian = awayTeam.overall.losses;
            const homeWinsMedian = homeTeam.overall.wins;
            const homeLossesMedian = homeTeam.overall.losses;

            awayTeam.futureMedian.wins += homeWinsMedian           
            awayTeam.futureMedian.losses += homeLossesMedian;            
            homeTeam.futureMedian.wins += awayWinsMedian;            
            homeTeam.futureMedian.losses += awayLossesMedian;  
        }
    }
});

Object.keys(taxilessTeams).forEach((id) => {
    const team = taxilessTeams[id]
    // console.log(team)
});

console.log(taxilessTeams)

// console.log(boxscore.data)
console.log('finished');
export { };