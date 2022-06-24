const weeks = [] as any[][];

const handleSplitWeeks = (starts: any, week: any[]) => {
  if (starts.length > 0) {
    if (starts[0].numDayInWeek != 7) {
      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week);
    } else if (starts[0].numDayInWeek === 7 && starts[1].numDayInWeek === 7) {
      week.push(starts[0]);
      starts.shift();
      handleSplitWeeks(starts, week);
    } else if (starts[0].numDayInWeek === 7 && starts[1].numDayInWeek != 7) {
      week.push(starts[0]);
      starts.shift();
      weeks.push(week);
      const newWeek = [] as any[];
      handleSplitWeeks(starts, newWeek);
    }
  } else if (starts.length === 0) {
    weeks.push(week);
    return;
  }
};

const splitStartsByWeek = (starts) => {
  let week = [] as any[];
  handleSplitWeeks(starts, week);
  return weeks;
};

export { splitStartsByWeek };