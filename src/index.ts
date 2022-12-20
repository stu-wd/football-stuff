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

import pkg from 'espn-fantasy-football-api/node';

const { Client, Boxscore } = pkg;
const myClient = new Client({ leagueId: dynastyId});

myClient.setCookies({ SWID: '{DEA1FB92-DABC-44DE-A1FB-92DABC74DE13}', espnS2: 'AECStaUhVylsnqStbeLGRK%2FkV0OgxwDwIAapSzNaqz8t4uUsfHoPHL%2B6HhwKwglrEWPrGgSa97SY%2BG4R42qkf3jngEml6SAbqwZ%2BbjT%2FNmLgRkcCHIwK6FnFwNyU4YVZRzB9bneNSTdjoS0gw%2B3RM2CtZkH1iPZsQPSp5Ewr09pr3N2Zzan0D8JbRDuV8vVqAVvtoLYbf0prE5mfb3t8HzUI8O9xN3XXVHnTWtYCIDcd6Nko3vOKx6uou2bu%2BOPRPrfSr65OyRdsY1LFpxYRpJcL' })

// const teams = await myClient.getTeamsAtWeek({ seasonId: 2021, scoringPeriodId: 2})

const boxscore = await myClient.getBoxscoreForWeek({seasonId: 2022, matchupPeriodId: 3, scoringPeriodId: 3 });

// console.log(boxscore);


// teams.forEach((team) => {
//   console.log(team.roster)
// })


// console.log(teams[0].roster);

// const scoreboard = await myClient.getHistoricalScoreboardForWeek({seasonId: 2021, matchupPeriodId: 6, scoringPeriodId: 6})

// console.log(scoreboard);

// const agents = await myClient.getFreeAgents({ seasonId: 2022, scoringPeriodId: 3})

// console.log(agents)

// const myBoxscore = new Boxscore({ leagueId: dynastyId })

// console.log(myBoxscore.homeRoster);

// import DynastyBoxscore from './classes/something';
import something2 from './classes/something2';

// const dynasty = new DynastyBoxscore({ leagueId: dynastyId, year: 2022 });

new something2(dynastyId, 2022)

export {};
