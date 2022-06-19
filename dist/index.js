import { getTeam } from './services/getTeam';
import xray from 'x-ray';
const x = xray();
const team = await getTeam();
const hitters = team.hitters;
const pitchers = team.pitchers;
const allPitchersAction = async (pitchers) => {
    const myFutureStarts = [];
    await Promise.all(pitchers.map(async (pitcher) => {
        const probStarts = await Promise.resolve(figureOutStarts(pitcher));
        myFutureStarts.push({ name: pitcher.fullName, probStarts });
    }));
    return myFutureStarts;
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
                let date = undefined;
                if (xray.UTC) {
                    date = new Date(xray.UTC).toUTCString().slice(0, 5) + new Date(xray.UTC).toLocaleString();
                }
                const crafted = {
                    game: words[0] + ' - ' + words[2],
                    date: date,
                    home: xray.pitchers[0],
                    away: xray.pitchers[1]
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
const myFutureStarts = await allPitchersAction(pitchers);
myFutureStarts.map((start) => console.log(start));
