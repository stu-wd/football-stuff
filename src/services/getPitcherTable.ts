import { getTeam } from './getTeam';
import { setMyStarts } from './setMyStarts';
import { setPitcherTable } from './setPitcherTable';
import { getCurrentMatchup } from './getCurrentMatchup';
import { Team } from '../models';

const getMyPitcherTable = async () => {
  const { pitchers } = await getTeam(9);
  const starts = await setMyStarts(pitchers);
  const table = setPitcherTable(starts);
  return table;
};

const getOpponentsPitcherTable = async () => {
  const teamId = await getCurrentMatchup();
  const { pitchers } = await getTeam(teamId);
  const starts = await setMyStarts(pitchers);
  const table = setPitcherTable(starts);
  return table;
};

const getWeekMatchup = async () => {
  const FudgeVelvet = await getMyPitcherTable();
  const Scrubs = await getOpponentsPitcherTable();

  console.table(FudgeVelvet);

  console.table(Scrubs);
};

export { getMyPitcherTable, getOpponentsPitcherTable, getWeekMatchup };