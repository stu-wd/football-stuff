import { getTeam } from './services/getTeam';
import xray from 'x-ray';
const x = xray();
const team = await getTeam();
const hitters = team.hitters;
const pitchers = team.pitchers;
pitchers.map((pitcher) => {
    const starts = pitcher.starterStatusByProGame;
    for (const gameId in starts) {
        if (starts[gameId] === 'PROBABLE') {
            const url = `https://www.espn.com/mlb/game?gameId=${gameId}`;
            x(url, {
                date: 'title',
                pitchers: ['.pitchers__row .fullName'],
            })((err, result) => {
                if (err)
                    return `ERROR ${err}`;
                else if (result.pitchers.length > 0)
                    formatEspnTitle(result.date, (newDate) => {
                        console.log(newDate, result.pitchers);
                    });
            });
        }
    }
});
const formatEspnTitle = (date, callback) => {
    const sliced = date.split(' - ');
    callback(sliced[0] + ' - ' + sliced[2]);
};
