import axios from 'axios';
import { create } from 'domain';
import {
  EspnBoxscore,
  EspnMatchup,
  EspnTeam,
} from '../models/espn-api-responses';
import { Matchup, Team, WinLoss } from '../models/my-league';
import { checksIfTaxi, createAllPlayMap } from '../services';
import TeamSchema from './team';

export default class something2 {
  private readonly leagueId: number;
  private readonly year: number;
  private currentWeek: number;

  private boxscore: EspnBoxscore;
  private boxscoreUrl: string;

  private teams: Record<string, Team>;
  private matchups: Record<string, Matchup[]> = {};
  private allPlayMap: Record<string, WinLoss>;

  constructor(leagueId: number, year: number) {
    this.leagueId = leagueId;
    this.year = year;
    this.boxscoreUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.year}/segments/0/leagues/${this.leagueId}/?view=mBoxscore`;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.setBoxscore();
    this.setCurrentWeek();
    this.setTeams();
    this.setAllPlayMap();
    this.loopBoxscoreSchedule();
    this.loopMatchups();
    this.loopTeams();
    console.log(this.teams['1']);
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

  private setCurrentWeek() {
    this.currentWeek =
      this.boxscore.scoringPeriodId <= 14 ? this.boxscore.scoringPeriodId : 14;
  }

  private createTeamEntries(): Record<string, Team> {
    const teams: Record<string, Team> = {};
    this.boxscore.teams.forEach((team: EspnTeam) => {
      if (!checksIfTaxi(team.id)) {
        const entry = new TeamSchema(team);
        teams[`${team.id}`] = entry;
      }
    });
    return teams;
  }

  private setTeams() {
    this.teams = this.createTeamEntries();
  }

  private setAllPlayMap() {
    this.allPlayMap = createAllPlayMap(this.teams);
  }

  private isValidMatchup(matchup: EspnMatchup) {
    const { away, home, matchupPeriodId } = matchup;
    return away && home && !checksIfTaxi(home.teamId) && matchupPeriodId <= 14;
  }

  private loopBoxscoreSchedule() {
    this.boxscore.schedule.forEach((matchup: EspnMatchup) => {
      if (this.isValidMatchup(matchup)) {
        this.setMatchups(matchup);
        this.setSchedule(matchup);
        this.setCumulativeRecords(matchup);
      }
    });
  }

  private loopMatchups() {
    Object.keys(this.matchups).forEach((weekId: string) => {
      const matchups: Matchup[] = this.matchups[weekId];
      this.setMedianRecords(matchups);
      this.setAllPlayByWeekRecords(matchups, weekId);
      this.setWeeklyRank(matchups, weekId);
    });
  }

  private loopTeams() {
    Object.keys(this.teams).forEach((teamId: string) => {
      const team = this.teams[teamId];
      this.setCombinedRecords(team);
      this.setAllPlayOverallRecords(team);
      this.setWeeklyRankAvg(team);
    });
  }

  private setMatchups(matchup: EspnMatchup) {
    const { away, home, matchupPeriodId } = matchup;
    const awayInfo = {
      teamId: away.teamId,
      score: away.totalPoints,
    };

    const homeInfo = {
      teamId: home.teamId,
      score: home.totalPoints,
    };

    if (!this.matchups[`${matchupPeriodId}`]) {
      this.matchups[`${matchupPeriodId}`] = [];
    }

    this.matchups[`${matchupPeriodId}`].push(awayInfo, homeInfo);
    this.sortMatchups(this.matchups[`${matchupPeriodId}`]);
  }

  private sortMatchups(matchups: Matchup[]): Matchup[] {
    return matchups.sort((a: Matchup, b: Matchup) => {
      return b.score - a.score;
    });
  }

  private setSchedule(matchup: EspnMatchup) {
    const { away, home, matchupPeriodId } = matchup;
    this.teams[`${away.teamId}`].schedule[`${matchupPeriodId}`] = home.teamId;
    this.teams[`${home.teamId}`].schedule[`${matchupPeriodId}`] = away.teamId;
  }

  private setCumulativeRecords(matchup: EspnMatchup) {
    const { away, home, matchupPeriodId } = matchup;

    const lastMatchup = matchupPeriodId - 1;

    const awayCumulativeLast =
      this.teams[`${away.teamId}`].records.myCumulative[`${lastMatchup}`];

    const homeCumulativeLast =
      this.teams[`${home.teamId}`].records.myCumulative[`${lastMatchup}`];

    let awayCumulative =
      this.teams[`${away.teamId}`].records.myCumulative[`${matchupPeriodId}`];

    let homeCumulative =
      this.teams[`${home.teamId}`].records.myCumulative[`${matchupPeriodId}`];

    if (away.totalPoints > home.totalPoints) {
      awayCumulative.wins = awayCumulativeLast.wins + 1;
      awayCumulative.losses = awayCumulativeLast.losses;

      homeCumulative.wins = homeCumulativeLast.wins;
      homeCumulative.losses = homeCumulativeLast.losses + 1;
    } else {
      awayCumulative.wins = awayCumulativeLast.wins;
      awayCumulative.losses = awayCumulativeLast.losses + 1;

      homeCumulative.wins = homeCumulativeLast.wins + 1;
      homeCumulative.losses = homeCumulativeLast.losses;
    }
  }

  private setMedianRecords(matchups: Matchup[]) {
    matchups.forEach((matchup, index) => {
      const middleIndex = Math.ceil(matchups.length / 2);
      const { teamId } = matchup;
      const team = this.teams[`${teamId}`];
      if (index < middleIndex) {
        team.records.myMedian.wins += 1;
      } else {
        team.records.myMedian.losses += 1;
      }
    });
  }

  private setAllPlayByWeekRecords(matchups: Matchup[], weekId: string) {
    matchups.forEach((matchup, index) => {
      const { teamId } = matchup;
      const team = this.teams[`${teamId}`];
      team.records.myAllPlayByWeek[weekId] = this.allPlayMap[`${index + 1}`];
    });
  }

  private setWeeklyRank(matchups: Matchup[], weekId: string) {
    matchups.forEach((matchup, index) => {
      const rank = index + 1;
      this.teams[`${matchup.teamId}`].weeklyRank[weekId] = rank;
    });
  }

  private setCombinedRecords(team: Team) {
    team.records.myCombined.wins =
      team.records.myWeekly.wins + team.records.myMedian.wins;

    team.records.myCombined.losses =
      team.records.myWeekly.losses + team.records.myMedian.losses;
  }

  private setAllPlayOverallRecords(team: Team) {
    const allPlays = team.records.myAllPlayByWeek;
    Object.keys(allPlays).forEach((weekId: string) => {
      const wins = allPlays[weekId].wins;
      team.records.myAllPlayOverall.wins += wins;
      const losses = allPlays[weekId].losses;
      team.records.myAllPlayOverall.losses += losses;
    });
  }

  private setWeeklyRankAvg(team: Team) {
    const { weeklyRank } = team;
    let total = 0;
    for (let index = 1; index < this.currentWeek; index++) {
      const element = weeklyRank[index];
      total += element;
    }
    team.weeklyRankAvg = Number((total / this.currentWeek).toFixed(2));
  }
}
