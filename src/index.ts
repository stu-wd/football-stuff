import axios from 'axios';
import { Start, Team } from './models';
import { getTeam } from './services/getTeam';
import { setMyStarts } from './services/setMyStarts';
import espn from './credentials';
import xray from 'x-ray';

const x = xray();

// const { pitchers, hitters }: Team = await getTeam();
// const myStarts = await setMyStarts(pitchers);

// class Game {
//   constructor(start) {
//     this.game = start.game;
//     this.dayTime = start.dayTime;
//     this.home = start.home;
//     this.away = start.away;
//     this.count = start.count;
//   }
//   count: number;
//   dayTime: string;
//   home: string;
//   away: string;
//   game: string;
// }

const response = await axios.get('https://fantasy.espn.com/baseball/boxscore?leagueId=1863581964&matchupPeriodId=13&seasonId=2022&teamId=9', espn.COOKIE).then((res: any) => res.data).catch((err) => console.log(err));

console.log(response);


const scrape = await x(response, 'body', 'div', 'table', 'tr')((err: any, result: any) => {
  if (err) return `ERROR ${err}`;
  else return result;
});

console.log(scrape);


// myStarts.startsByWeek.map((starts: Start[], index: number) => {
//   const weekNumber = index + 1;
//   const week = [];
//   starts.map((start: Start) => {
//     week.push(new Game(start));

//   });
//   const count = week.reduce((partialSum, element) => partialSum + element.count, 0);
//   week.push({ count: count, away: "TOTAL STARTS => " });
//   console.table(week);
// });

console.log('finished');
export { };