import { getTeam } from './services/getTeam';
import xray from 'x-ray';
const x = xray();
const team = await getTeam();
const hitters = team.hitters;
const pitchers = team.pitchers;
const allPitchersAction = async (pitchers) => {
    const startsByPitcher = [];
    await Promise.all(pitchers.map(async (pitcher) => {
        const probStarts = await Promise.resolve(figureOutStarts(pitcher));
        startsByPitcher.push({ name: pitcher.fullName, probStarts });
    }));
    const allStarts = [];
    startsByPitcher.filter((pitcher) => pitcher.probStarts.length > 0).map((pitcher) => pitcher.probStarts.sort((a, b) => a.jsDate - b.jsDate).forEach((start) => allStarts.push(start)));
    allStarts.sort((a, b) => {
        return a.jsDate - b.jsDate;
    });
    return {
        startsByPitcher,
        allStarts
    };
};
const figureOutStarts = async (pitcher) => {
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
                let jsDate = new Date(words[2]);
                let dayTime = new Date(words[2]).toUTCString().slice(0, 5);
                if (xray.UTC) {
                    dayTime += new Date(xray.UTC).toLocaleString().split(', ')[1];
                }
                else {
                    dayTime += 'TBD';
                }
                const crafted = {
                    game: words[0] + ' - ' + words[2],
                    dayTime,
                    away: xray.pitchers[0],
                    home: xray.pitchers[1],
                    UTC: xray.UTC,
                    gameId,
                    jsDate
                };
                probStarts.push(crafted);
            }
        }
    }
    ;
    return probStarts;
};
const formatResponse = (result) => {
    result.date = new Date(result.UTC).toUTCString().slice(0, 5) + new Date(result.UTC).toLocaleString();
    return result;
};
const myStarts = await allPitchersAction(pitchers);
console.log(myStarts.allStarts);
