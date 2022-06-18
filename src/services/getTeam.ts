import axios from 'axios';
import espn from './credentials';

const getTeam = async () => {
  const team = {
    pitchers: [] as any[],
    hitters: [] as any[],
  };

  await axios
    .get(espn.ENDPOINT, {
      headers: {
        Cookie: espn.COOKIE,
      },
    })
    .then((res) => {
      res.data.roster.entries
        .map((entry: any) => entry.playerPoolEntry.player)
        .map((player: any) => {
          player.defaultPositionId === 1 || player.defaultPositionId === 11
            ? team.pitchers.push(player)
            : team.hitters.push(player);
        });
    })
    .catch((err) => console.log(err));

  return team;
};

export { getTeam };