import { Player, Start, StartsByPitcher } from '../models';
import xray from 'x-ray';

const x = xray();

const scrapeStarts = async (pitcher: Player, pitchers: Player[]): Promise<Start[]> => {
  const probStarts = [] as Start[];
  const starts = pitcher.starterStatusByProGame;
  const filtered = Object.entries(starts).filter((tuple: string[]) => tuple[1] === 'PROBABLE');
  const trimmed = filtered.slice(filtered.length - 3, filtered.length);

  await Promise.all(trimmed.map(async (start: string[]) => {
    const url = `https://www.espn.com/mlb/game?gameId=${start[0]}`;
    const xray = await x(url, {
      title: 'title',
      UTC: '.game-status span@data-date',
      pitchers: ['.pitchers__row .fullName'],
    })(async (err: any, result: any) => {
      if (err) return `ERROR ${err}`;
      else return await result;
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
        gameId: start[0],
        jsDate,
        count,
        numDayInWeek
      };
      probStarts.push(crafted);
    }
  }));
  return probStarts;

};

export { scrapeStarts };