import { Player, Team } from './models';
import { getTeam } from './services/getTeam';
import xray from 'x-ray';

const x = xray();

const team: Team = await getTeam();
const hitters: Player[] = team.hitters;
const pitchers: any[] = team.pitchers;

const allPitchersAction = async (pitchers: any[]) => {
  const myFutureStarts = [] as any[];
  await Promise.all(pitchers.map(async (pitcher: any) => {
    const probStarts = await Promise.resolve(figureOutStarts(pitcher));
    myFutureStarts.push({ name: pitcher.fullName, probStarts });
  }));
  return myFutureStarts;
};

const figureOutStarts = async (pitcher: Player) => {
  const probStarts = [] as any[];
  const starts = pitcher.starterStatusByProGame;
  for (const gameId in starts) {
    if (starts[gameId] === 'PROBABLE') {
      const url = `https://www.espn.com/mlb/game?gameId=${gameId}`;
      const xray = await x(url, {
        title: 'title',
        UTC: '.game-status span@data-date',
        pitchers: ['.pitchers__row .fullName'],
      })((err: any, result: any) => {
        if (err) return `ERROR ${err}`;
        else return result;
      });

      if (xray.pitchers.length > 0) {
        const words = xray.title.split(' - ');
        let date = undefined;
        if (xray.UTC) {
          date = new Date(xray.UTC).toUTCString().slice(0, 5) + new Date(xray.UTC).toLocaleString();
        }
        const crafted = {
          game: words[0] + ' - ' + words[2],
          date: date,
          home: xray.pitchers[0],
          away: xray.pitchers[1]
        };
        probStarts.push(crafted);
      }
    }
  };
  return probStarts;
};

const formatResponse = (result: any) => {
  result.date = new Date(result.UTC).toUTCString().slice(0, 5) + new Date(result.UTC).toLocaleString();
  return result;
};

const myFutureStarts = await allPitchersAction(pitchers);

myFutureStarts.map((start: any) => console.log(start));



export { };