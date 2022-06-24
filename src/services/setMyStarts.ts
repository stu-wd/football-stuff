import { Player, Start, StartsByPitcher } from '../models';
import { scrapeStarts } from './scrapeStarts';
import { morphStarts } from './morphStarts';

const setMyStarts = async (pitchers: Player[]) => {
  const startsByPitcher = [] as StartsByPitcher[];
  await Promise.all(pitchers.map(async (pitcher: any) => {
    const probStarts = await Promise.resolve(scrapeStarts(pitcher, pitchers));
    startsByPitcher.push({ name: pitcher.fullName, probStarts });
  }));

  let allStarts = [] as Start[];

  startsByPitcher.filter((pitcher: StartsByPitcher) => pitcher.probStarts.length > 0).map((pitcher: StartsByPitcher) => pitcher.probStarts.sort((a: any, b: any) => a.jsDate - b.jsDate).forEach((start: Start) => allStarts.push(start)));

  return {
    startsByPitcher,
    startsByWeek: morphStarts(allStarts)
  };
};

export { setMyStarts };