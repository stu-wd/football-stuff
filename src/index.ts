import { Player, Team } from './models';
import { getTeam } from './services/getTeam';
import xray from 'x-ray';

const x = xray();

const team: Team = await getTeam();
const hitters: Player[] = team.hitters;
const pitchers: any[] = team.pitchers;

const allPitchersAction = async (pitchers: any[]) => {
  const startsByPitcher = [] as any[];
  await Promise.all(pitchers.map(async (pitcher: any) => {
    const probStarts = await Promise.resolve(figureOutStarts(pitcher));
    startsByPitcher.push({ name: pitcher.fullName, probStarts });
  }));

  let allStarts = [] as any[];

  startsByPitcher.filter((pitcher: any) => pitcher.probStarts.length > 0).map((pitcher: any) => pitcher.probStarts.sort((a, b) => a.jsDate - b.jsDate).forEach((start: any) => allStarts.push(start)));

  allStarts.sort((a, b) => {
    return a.jsDate - b.jsDate;
  });

  allStarts = allStarts.filter((element, index, array) => index === array.findIndex((ele) => (
    ele.gameId === element.gameId
  )));


  return {
    startsByPitcher,
    allStarts
  };
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
        const away = xray.pitchers[0];
        const home = xray.pitchers[1];
        const game = words[0] + ' - ' + words[2];
        const jsDate = new Date(words[2]);
        let dayTime = new Date(words[2]).toUTCString().slice(0, 5);
        let count = 0;
        if (xray.UTC) {
          dayTime += new Date(xray.UTC).toLocaleString().split(', ')[1];
        } else {
          dayTime += 'TBD';
        }
        // if (pitchers.filter((pitcher: any) => pitcher.fullName === away)) {
        //   count += 1;
        // }
        // if (pitchers.filter((pitcher: any) => pitcher.fullName === home)) {
        //   count += 1;
        // }
        // if (pitchers.find(({ fullName }: any) => fullName === home != undefined)) count += 1;
        // if (pitchers.find(({ fullName }: any) => fullName === away != undefined)) count += 1;
        if (pitchers.findIndex(pitcher => pitcher.fullName === home) != -1) {
          // console.log('HOME: ', pitcher.fullName, home, game);
          count += 1;
        }
        if (pitchers.findIndex(pitcher => pitcher.fullName === away) != -1) {
          // console.log('AWAY: ', pitcher.fullName, away, game);
          count += 1;
        }
        const crafted = {
          game,
          dayTime,
          away,
          home,
          UTC: xray.UTC,
          gameId,
          jsDate,
          count
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

const myStarts = await allPitchersAction(pitchers);

let startsCount = 0;
myStarts.allStarts.map((start) => startsCount += start.count);

console.log(startsCount, myStarts.allStarts.length);



export { };