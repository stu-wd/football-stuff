import { Player } from "../models/index";

const setPlayerEntry = (player) => {
  const { defaultPositionId, eligibleSlots, fullName, gamesPlayedByPosition, id, injuryStatus, proTeamId, starterStatusByProGame } = player;
  return {
    defaultPositionId, eligibleSlots, fullName, gamesPlayedByPosition, id, injuryStatus, proTeamId, starterStatusByProGame
  };
};

export { setPlayerEntry };