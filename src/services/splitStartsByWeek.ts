import { Start } from '../models';

const handleSplitWeeks = (starts: any, week: any[], weeks: any[]): Start[] => {
  if (starts.length > 0) {
    if (starts[0].numDayInWeek != 7) {
      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week, weeks);
    } else if (starts[0].numDayInWeek === 7 && starts[1] != undefined && starts[1].numDayInWeek === 7) {
      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week, weeks);
    } else if (starts[0].numDayInWeek === 7 && starts[1] != undefined && starts[1].numDayInWeek != 7) {
      week.push(starts[0]);
      starts.shift();
      weeks.push(week);
      const newWeek = [] as any[];
      handleSplitWeeks(starts, newWeek, weeks);
    } else if (starts[1] === undefined) {
      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week, weeks);
    }
  } else if (starts.length === 0) {
    weeks.push(week);
    return;
  }
};

const splitStartsByWeek = (starts: Start[]): Start[][] => {
  const weeks = [] as Start[][];
  let week = [] as Start[];
  handleSplitWeeks(starts, week, weeks);
  return weeks;
};

export { splitStartsByWeek };