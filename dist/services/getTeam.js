import axios from 'axios';
import espn from './credentials';
const getTeam = async () => {
    const team = {
        pitchers: [],
        hitters: [],
    };
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
        .catch((err) => console.log(err));
    return team;
};
export { getTeam };
