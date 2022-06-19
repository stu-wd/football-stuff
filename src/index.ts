import { Player, Team } from './models';
import { getTeam } from './services/getTeam';
import xray from 'x-ray';
import { log } from 'console';
import { start } from 'repl';
import { Stats } from 'fs';

const x = xray();

const team: Team = await getTeam();
const hitters: Player[] = team.hitters;
const pitchers: any[] = team.pitchers;

const weeks = [] as any[][];
const handleSplitWeeks = (starts: any, week: any[], callback) => {
  if (starts.length > 0) {

    if (starts[0].numDayInWeek != 7) {
      console.log('1st');
      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week, callback);
    } else if (starts[0].numDayInWeek === 7 && starts[1].numDayInWeek === 7) {
      console.log('2nd');

      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week, callback);
    } else if (starts[0].numDayInWeek === 7 && starts[1].numDayInWeek != 7) {
      console.log('3rd');

      week.push(starts[0]);
      starts.shift();
      weeks.push(week);
      const newWeek = [] as any[];
      handleSplitWeeks(starts, newWeek, callback);
    }
  } else if (starts.length === 0) {
    weeks.push(week);
    return;
  }
};

const weekContainer = (starts) => {
  let week = [] as any[];
  handleSplitWeeks(starts, week, (data) => {
    // data === week seems truthy
    // console.log('DATA: ', data, 'WEEK: ', week);
    weeks.push(data.week);
  });
  return weeks;
};

const allPitchersAction = async (pitchers: any[]) => {
  const startsByPitcher = [] as any[];
  await Promise.all(pitchers.map(async (pitcher: any) => {
    const probStarts = await Promise.resolve(scrapeStarts(pitcher));
    startsByPitcher.push({ name: pitcher.fullName, probStarts });
  }));

  let allStarts = [] as any[];

  startsByPitcher.filter((pitcher: any) => pitcher.probStarts.length > 0).map((pitcher: any) => pitcher.probStarts.sort((a, b) => a.jsDate - b.jsDate).forEach((start: any) => allStarts.push(start)));

  const morphAllStarts = (allStarts: any[]) => {
    return allStarts.filter((element, index, array) => index === array.findIndex((ele) => (
      ele.gameId === element.gameId
    ))).sort((a, b) => a.jsDate - b.jsDate);
  };

  allStarts = allStarts.filter((element, index, array) => index === array.findIndex((ele) => (
    ele.gameId === element.gameId
  ))).sort((a, b) => a.jsDate - b.jsDate);

  const splitWeeks = weekContainer(allStarts);

  console.log('SPLIT WEEKS: ', splitWeeks);


  return {
    startsByPitcher,
    allStarts: morphAllStarts(allStarts)
  };
};

const scrapeStarts = async (pitcher: Player) => {
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
        let numDayInWeek = undefined as number;
        if (jsDate.getDay() === 0) numDayInWeek = 7;
        else numDayInWeek = jsDate.getDay();
        let dayTime = new Date(words[2]).toUTCString().slice(0, 5);
        let count = 0;
        if (xray.UTC) {
          dayTime += new Date(xray.UTC).toLocaleString().split(', ')[1];
        } else {
          dayTime += 'TBD';
        }
        if (pitchers.findIndex(pitcher => pitcher.fullName === home) != -1) {
          count += 1;
        }
        if (pitchers.findIndex(pitcher => pitcher.fullName === away) != -1) {
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
          count,
          numDayInWeek
        };
        probStarts.push(crafted);
      }
    }

  };
  return probStarts;
};


function Game(start) {
  this.count = start.count;
  this.dayTime = start.dayTime;
  this.home = start.home;
  this.away = start.away;
  this.gameId = start.gameId;
}

const myStarts = await allPitchersAction(pitchers);
// console.log(myStarts);
const starts = {};

// myStarts.allStarts.map((start) => {
//   const tableInfo = new Game(start);
//   starts[start.game] = tableInfo;
// });

// console.table(starts);




export { };