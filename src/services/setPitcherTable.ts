import { MyStarts, Start, TableEntry } from '../models';

const setPitcherTable = (starts: MyStarts) => {
  const week = [];
  starts.startsByWeek.map((starts: Start[], index: number) => {
    const weekNumber = index + 1;
    starts.map((start: Start) => {
      week.push(new TableEntry(start));
    });
    const count = week.reduce((partialSum, element) => partialSum + element.count, 0);
    week.push({ count: count, away: "TOTAL STARTS => " });
  });
  return week;
};

export { setPitcherTable };