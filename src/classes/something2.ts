import axios from 'axios';
import { EspnBoxscore, EspnTeam } from '../models/espn-api-responses';
import { Matchup, TeamSchema } from '../models/my-league';
import { checksIfTaxi, fetchUrl } from '../services';
import Team from './team';

export default class something2 {
  public readonly leagueId: number;
  public readonly year: number;

  public boxscore: EspnBoxscore;
  private boxscoreUrl: string;

  public teams: Record<string, TeamSchema>;
  public matchups: Record<string, Matchup[]>;

  constructor(leagueId: number, year: number) {
    this.leagueId = leagueId;
    this.year = year;
    this.boxscoreUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.year}/segments/0/leagues/${this.leagueId}/?view=mBoxscore`;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.setBoxscore();
    this.setTeams();
    this.setMatchups();
    this.setMedianRecords();
  }

  private async getBoxscore(): Promise<EspnBoxscore> {
    try {
      const response = await axios.get(this.boxscoreUrl);
      return response.data;
    } catch (error) {
      throw new Error('Axios error');
    }
  }

  private async setBoxscore(): Promise<void> {
    this.boxscore = await this.getBoxscore();
  }

  private createTeamEntries(): Record<string, TeamSchema> {
    const teams: Record<string, TeamSchema> = {};
    this.boxscore.teams.forEach((team: EspnTeam) => {
      if (!checksIfTaxi(team.id)) {
        const entry = new Team(team);
        teams[`${team.id}`] = entry;
      }
    });
    return teams;
  }

  private setTeams(): void {
    this.teams = this.createTeamEntries();
  }

  private createMatchups() {
    const matchups: Record<string, Matchup[]> = {};
    this.boxscore.schedule.forEach((matchup) => {
      const { away, home, matchupPeriodId } = matchup;
      if (away && home && !checksIfTaxi(home.teamId) && matchupPeriodId <= 14) {
        const awayInfo = {
          teamId: away.teamId,
          score: away.totalPoints,
          opponentId: home.teamId,
        };

        const homeInfo = {
          teamId: home.teamId,
          score: home.totalPoints,
          opponentId: away.teamId,
        };

        if (!matchups[`${matchupPeriodId}`]) {
          matchups[`${matchupPeriodId}`] = [];
        }

        matchups[`${matchupPeriodId}`].push(awayInfo, homeInfo);

        this.sortMatchups(matchups[`${matchupPeriodId}`]);
      }
    });
    return matchups;
  }

  private sortMatchups(matchups: Matchup[]): Matchup[] {
    return matchups.sort((a: Matchup, b: Matchup) => {
      return b.score - a.score;
    });
  }

  private setMatchups() {
    this.matchups = this.createMatchups();
  }

  private setMedianRecords() {
    Object.keys(this.matchups).forEach((weekId: string) => {
      const matchups: Matchup[] = this.matchups[weekId];
      matchups.forEach((scorecard, index) => {
        const middleIndex = Math.ceil(matchups.length / 2);
        const { teamId } = scorecard;
        if (index < middleIndex) {
          this.teams[`${scorecard.teamId}`].records.myMedian.wins += 1;
        } else {
          this.teams[`${scorecard.teamId}`].records.myMedian.losses += 1;
        }
      });
    });
  }
}
