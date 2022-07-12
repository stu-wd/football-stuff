import axios from 'axios';
import espn from '../credentials';
import { Player, Team } from '../models';
import { setPlayerEntry } from './setTeam';



const getTeam = async (teamId): Promise<Team> => {
  const team: Team = {
    pitchers: [] as Player[],
    hitters: [] as Player[],
  };
  await axios
    .get(espn.ENDPOINTMAKER(teamId), espn.COOKIE)
    .then((res) => {
      res.data.roster.entries
        .map((entry: any) => entry.playerPoolEntry.player).map((player: any): Player => setPlayerEntry(player)).map((player: Player) => {
          player.defaultPositionId === 1 || player.defaultPositionId === 11
            ? team.pitchers.push(player)
            : team.hitters.push(player);
        });
    })
    .catch((err) => console.log(`Error: ${err}`));
  return team;
};

export { getTeam };