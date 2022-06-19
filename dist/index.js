import { getTeam } from './services/getTeam';
import xray from 'x-ray';
const x = xray();
const team = await getTeam();
const hitters = team.hitters;
const pitchers = team.pitchers;
const allPitchersAction = async (pitchers) => {
    const startsByPitcher = [];
    await Promise.all(pitchers.map(async (pitcher) => {
        const probStarts = await Promise.resolve(scrapeStarts(pitcher));
        startsByPitcher.push({ name: pitcher.fullName, probStarts });
    }));
    const allStarts = [];
    startsByPitcher.filter((pitcher) => pitcher.probStarts.length > 0).map((pitcher) => pitcher.probStarts.sort((a, b) => a.jsDate - b.jsDate).forEach((start) => allStarts.push(start)));
    allStarts.sort((a, b) => {
        return a.jsDate - b.jsDate;
    });
    const allStartsNoDupes = allStarts.filter((element, index, array) => index === array.findIndex((ele) => (ele.gameId === element.gameId)));
    return {
        startsByPitcher,
        allStartsNoDupes
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
                    count
                };
                probStarts.push(crafted);
            }
        }
    }
    ;
    return probStarts;
};
const myStarts = await allPitchersAction(pitchers);
let startsCount = 0;
myStarts.allStartsNoDupes.map((start) => startsCount += start.count);
console.log(myStarts.allStartsNoDupes);
