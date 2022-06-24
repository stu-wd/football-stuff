import axios from 'axios';
import espn from '../credentials';
const team = {
    pitchers: [],
    hitters: [],
};
const getTeam = async () => {
    await axios
        .get(espn.ENDPOINT, espn.COOKIE)
        .then((res) => {
        res.data.roster.entries
            .map((entry) => entry.playerPoolEntry.player).map((player) => {
            const { defaultPositionId, eligibleSlots, fullName, gamesPlayedByPosition, id, injuryStatus, proTeamId, starterStatusByProGame, stats } = player;
            return {
                defaultPositionId, eligibleSlots, fullName, gamesPlayedByPosition, id, injuryStatus, proTeamId, starterStatusByProGame
            };
        })
            .map((player) => {
            player.defaultPositionId === 1 || player.defaultPositionId === 11
                ? team.pitchers.push(player)
                : team.hitters.push(player);
        });
    })
        .catch((err) => console.log(`Error: ${err}`));
    return {
        hitters: team.hitters,
        pitchers: team.pitchers
    };
};
export { getTeam };
