import { splitStartsByWeek } from './splitStartsByWeek';

const morphStarts = (allStarts: any[]) => {
  const morphed = allStarts.filter((element, index, array) => index === array.findIndex((ele) => (
    ele.gameId === element.gameId
  ))).sort((a, b) => a.jsDate - b.jsDate);
  return splitStartsByWeek(morphed);
};

export { morphStarts };