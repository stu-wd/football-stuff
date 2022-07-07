import { MyStarts, Player, Start, StartsByPitcher } from '../models';
import { scrapeStarts } from './scrapeStarts';
import { morphStarts } from './morphStarts';

const setMyStarts = async (pitchers: Player[]): Promise<MyStarts> => {
  const startsByPitcher = [] as StartsByPitcher[];
  await Promise.all(pitchers.map(async (pitcher: Player) => {
    const probStarts = await Promise.resolve(scrapeStarts(pitcher, pitchers));
    startsByPitcher.push({ name: pitcher.fullName, probStarts });
  }));

  let allStarts = [] as Start[];

  startsByPitcher.filter((pitcher: StartsByPitcher) => pitcher.probStarts.length > 0).map((pitcher: StartsByPitcher) => pitcher.probStarts.forEach((start: Start) => allStarts.push(start)));

  return {
    startsByPitcher,
    startsByWeek: morphStarts(allStarts)
  };
};

export { setMyStarts };