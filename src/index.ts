import { Player, Team } from './models';
import { getTeam } from './services/getTeam';
import { setMyStarts } from './services/setMyStarts';

import xray from 'x-ray';


const x = xray();

const { pitchers, hitters }: Team = await getTeam();
const myStarts = await setMyStarts(pitchers);





function Game(start) {
  this.count = start.count;
  this.dayTime = start.dayTime;
  this.home = start.home;
  this.away = start.away;
  this.gameId = start.gameId;
}


// myStarts.allStarts.map((week: any, index: number) => {
//   let starts = 0;
//   week.map((start: any) => {
//     starts += start.count;
//   });
//   console.log(`We have ${starts} this week over ${week.length} starts`);
// });

// myStarts.allStarts.map((week: any) => {
//   week.map((game: any) => console.log(`${game.game} - ${game.away} vs ${game.home}`));
// });

export { };