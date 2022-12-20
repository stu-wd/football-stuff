import axios from 'axios';
import { createHistogram } from 'perf_hooks';
import { EspnBoxscore, EspnTeam } from '../models/espn-api-responses';
import { Matchup, TeamSchema, WinLoss } from '../models/my-league';
import { checksIfTaxi, createAllPlayMap, fetchUrl } from '../services';
import Team from './team';

export default class something2 {
  public readonly leagueId: number;
  public readonly year: number;

  public boxscore: EspnBoxscore;
  private boxscoreUrl: string;

  public teams: Record<string, TeamSchema>;
  public matchups: Record<string, Matchup[]>;
  private allPlayMap: Record<string, WinLoss>;

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
    this.setCombinedRecords();
    this.setAllPlayRecords();
    console.log(this.teams['1'].records.myAllPlay);
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
        const team = this.teams[`${teamId}`];
        if (index < middleIndex) {
          team.records.myMedian.wins += 1;
        } else {
          team.records.myMedian.losses += 1;
        }
      });
    });
  }

  private setCombinedRecords() {
    Object.keys(this.teams).forEach((teamId: string) => {
      const team = this.teams[teamId];
      team.records.myCombined.wins =
        team.records.myWeekly.wins + team.records.myMedian.wins;

      team.records.myCombined.losses =
        team.records.myWeekly.losses + team.records.myMedian.losses;
    });
  }

  private setAllPlayRecords() {
    this.allPlayMap = createAllPlayMap(this.teams);
    console.log(this.allPlayMap);
    Object.keys(this.matchups).forEach((weekId: string) => {
      const matchups = this.matchups[weekId];
      matchups.forEach((scorecard, index) => {
        const { teamId } = scorecard;
        const team = this.teams[`${teamId}`];
        team.records.myAllPlay[weekId] = this.allPlayMap[`${index + 1}`];
      });
    });
  }
}
