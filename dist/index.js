import { getTeam } from './services/getTeam';
import xray from 'x-ray';
const x = xray();
const team = await getTeam();
const hitters = team.hitters;
const pitchers = team.pitchers;
const weeks = [];
const handleSplitWeeks = (starts, week) => {
    if (starts.length > 0) {
        if (starts[0].numDayInWeek != 7) {
            week.push(starts[0]);
            starts.shift();
            handleSplitWeeks(starts, week);
        }
        else if (starts[0].numDayInWeek === 7 && starts[1].numDayInWeek === 7) {
            week.push(starts[0]);
            starts.shift();
            handleSplitWeeks(starts, week);
        }
        else if (starts[0].numDayInWeek === 7 && starts[1].numDayInWeek != 7) {
            week.push(starts[0]);
            starts.shift();
            weeks.push(week);
            const newWeek = [];
            handleSplitWeeks(starts, newWeek);
        }
    }
    else if (starts.length === 0) {
        weeks.push(week);
        return;
    }
};
const weekContainer = (starts) => {
    let week = [];
    handleSplitWeeks(starts, week);
    return weeks;
};
const allPitchersAction = async (pitchers) => {
    const startsByPitcher = [];
    await Promise.all(pitchers.map(async (pitcher) => {
        const probStarts = await Promise.resolve(scrapeStarts(pitcher));
        startsByPitcher.push({ name: pitcher.fullName, probStarts });
    }));
    let allStarts = [];
    startsByPitcher.filter((pitcher) => pitcher.probStarts.length > 0).map((pitcher) => pitcher.probStarts.sort((a, b) => a.jsDate - b.jsDate).forEach((start) => allStarts.push(start)));
    const morphAllStarts = (allStarts) => {
        const morphed = allStarts.filter((element, index, array) => index === array.findIndex((ele) => (ele.gameId === element.gameId))).sort((a, b) => a.jsDate - b.jsDate);
        return weekContainer(morphed);
    };
    return {
        startsByPitcher,
        allStarts: morphAllStarts(allStarts)
    };
};
const scrapeStarts = async (pitcher) => {
    const probStarts = [];
    const starts = pitcher.starterStatusByProGame;
    for (const gameId in starts) {
        if (starts[gameId] === 'PROBABLE') {
            const url = `https://www.espn.com/mlb/game?gameId=${gameId}`;
            const xray = await x(url, {
                title: 'title',
                UTC: '.game-status span@data-date',
                pitchers: ['.pitchers__row .fullName'],
            })((err, result) => {
                if (err)
                    return `ERROR ${err}`;
                else
                    return result;
            });
            if (xray.pitchers.length > 0) {
                const words = xray.title.split(' - ');
                const away = xray.pitchers[0];
                const home = xray.pitchers[1];
                const game = words[0] + ' - ' + words[2];
                const jsDate = new Date(words[2]);
                let numDayInWeek = undefined;
                if (jsDate.getDay() === 0)
                    numDayInWeek = 7;
                else
                    numDayInWeek = jsDate.getDay();
                let dayTime = new Date(words[2]).toUTCString().slice(0, 5);
                let count = 0;
                if (xray.UTC) {
                    dayTime += new Date(xray.UTC).toLocaleString().split(', ')[1];
                }
                else {
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
    }
    ;
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
// console.log(myStarts.allStarts);
// myStarts.allStarts.map((start) => {
//   const tableInfo = new Game(start);
//   starts[start.game] = tableInfo;
// });
const tableStarts = myStarts.allStarts.map((week, bigIndex) => {
    const starts = {};
    week.map((start, index) => {
        console.log(bigIndex, start);
        starts[bigIndex] = new Game(start);
    });
    return starts;
});
console.log('TABLE: ', tableStarts);
