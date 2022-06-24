import axios from 'axios';
import espn from '../credentials';
import { Player, Team } from '../models';

const team: Team = {
  pitchers: [] as Player[],
  hitters: [] as Player[],
};

const getTeam = async () => {
  await axios
    .get(espn.ENDPOINT, espn.COOKIE)
    .then((res) => {
      res.data.roster.entries
        .map((entry: any) => entry.playerPoolEntry.player).map((player: any): Player => {
          const { defaultPositionId, eligibleSlots, fullName, gamesPlayedByPosition, id, injuryStatus, proTeamId, starterStatusByProGame, stats } = player;
          return {
            defaultPositionId, eligibleSlots, fullName, gamesPlayedByPosition, id, injuryStatus, proTeamId, starterStatusByProGame
          };
        })
        .map((player: Player) => {
          player.defaultPositionId === 1 || player.defaultPositionId === 11
            ? team.pitchers.push(player)
            : team.hitters.push(player);
        });
    })
    .catch((err) => console.log(`Error: ${err}`));

  return {
    hitters: team.hitters as Player[],
    pitchers: team.pitchers as Player[]
  };

};

export { getTeam };