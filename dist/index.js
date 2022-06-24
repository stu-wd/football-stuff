import { getTeam } from './services/getTeam';
import { setMyStarts } from './services/setMyStarts';
import xray from 'x-ray';
const x = xray();
const { pitchers, hitters } = await getTeam();
const myStarts = await setMyStarts(pitchers);
// console.log(myStarts.startsByWeek[0]);
function Game(start) {
    this.count = start.count;
    this.dayTime = start.dayTime;
    this.home = start.home;
    this.away = start.away;
    this.gameId = start.gameId;
}
