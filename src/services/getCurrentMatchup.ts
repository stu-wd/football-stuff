import axios from 'axios';
import espn from '../credentials';
import { Player, Team } from '../models';
import { setPlayerEntry } from './setTeam';
import xray from 'x-ray';


const getCurrentMatchup = async () => await axios.get('https://fantasy.espn.com/apis/v3/games/flb/seasons/2022/segments/0/leagues/1863581964/?view=mMatchup', espn.COOKIE).then(async (res: any) => {
  const matchups = res.data.schedule.filter((game: any) => game.winner === 'UNDECIDED').filter((homeAway: any) => {
    if (homeAway.home.teamId === 9 || homeAway.away.teamId === 9) return homeAway;
  });

  const x = xray();
  x(`https://fantasy.espn.com/baseball/boxscore?leagueId=1863581964&matchupPeriodId=${matchups[0].matchupPeriodId}&seasonId=2022&teamId=9`, 'body@html')((err: any, result: any) => {
    if (err) console.log({ err });
    if (result) {
      console.log(typeof result);
      result.includes('P:') ? console.log('yes') : null;

    }
  });

  return matchups[0].home.teamId != 9 ? matchups[0].home.teamId : matchups[0].away.teamId;
}).catch((err: any) => console.log(err));

export { getCurrentMatchup };