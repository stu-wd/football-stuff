// import { fetchUrl } from '../services';
// import { EspnBoxscore, EspnTeam } from '../models/espn-api-responses';
// import { createAllPlayMap, TeamSchema, TeamStarter, TeamVariables, WinLoss } from '../models/my-league';

// export default class DynastyBoxscore {
//   leagueId: number;
//   year: number;
//   boxscoreUrl: string;
//   boxscore: EspnBoxscore;
//   teams: Record<string, TeamSchema> = {};
//   matchups: Record<
//     string,
//     { teamId: number; score: number; opponentId: number }[]
//   > = {};
//   currentWeek: number;
//   standardDeviations: Record<string, number> = {};
//   allPlayMap: Record<string, WinLoss> = {};

//   constructor(info: { leagueId: number; year: number }) {
//     this.leagueId = info.leagueId;
//     this.year = info.year;
//     this.boxscoreUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${this.year}/segments/0/leagues/${this.leagueId}/?view=mBoxscore`;
//     this.initialize();
//   }

//   private initialize() {
//     this.setBoxscore();
//     console.log('boxscore', this.boxscore);
    
//     this.setCurrentWeek();
//     this.createTeamEntries();
//     // this.setAllPlayMap();
//     this.handleSetup();
//     // console.log(this.teams['1'].weeklyRank);
    
//     this.setRecords();
//     // this.setWeeklyRank();
//     // this.setAllPlayRecords();
//     // this.setWeeklyDeviation();
    
//   }

//   setCurrentWeek() {
//     this.currentWeek = this.boxscore.scoringPeriodId;
//   }

//   setSchedule(variables: TeamVariables) {
//     const { awayTeam, homeTeam, matchupPeriodId } = variables;

//     awayTeam.schedule[`${matchupPeriodId}`] = homeTeam.id;
//     homeTeam.schedule[`${matchupPeriodId}`] = awayTeam.id;
//   }

//   setWeeklyRank(weekId: string) {
//     const matchups = this.matchups[weekId];

//     this.sortMatchups(matchups);

//     matchups.forEach((scorecard, index) => {
//       const { teamId } = scorecard;
//       // console.log(index, weekId, { teamId }, this.teams[`${teamId}`].teamName);
      
//       const teamRank = index + 1;

//       const team = this.teams[`${teamId}`];

//       if (!team.weeklyRank[weekId]) {
//         team.weeklyRank[weekId] = teamRank;
//       }
      

//       // team.weeklyRank[weekId] = teamRank;
//     })
//     // for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//     //   const week = this.matchups[`${weekId}`];
//     //   week.forEach((scorecard, index) => {
//     //     const rank = index + 1;
//     //     const { teamId } = scorecard;
//     //     this.teams[`${teamId}`].weeklyRank[`${weekId}`] = rank;
//     //   });
//     // }
//   }

//   getStandardDeviation = (arr: number[]) => {
//     const mean = arr.reduce((acc, curr) => {
//       return acc + curr
//     }, 0) / arr.length;

//     arr = arr.map((k) => {
//       return (k - mean) ** 2;
//     })

//     const sum = arr.reduce((acc, curr) => acc + curr, 0);

//     const variance = sum / arr.length;

//     return Math.sqrt(variance)
//   }

//   setWeeklyDeviation() {
//     for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//       const week = this.matchups[weekId];

//       const scores: number[] = [];

//       week.forEach((scorecard) => scores.push(scorecard.score));

//       const standardDeviation = this.getStandardDeviation(scores);

//       this.standardDeviations[String(weekId)] = standardDeviation;
//     }
//   }

//   private createTeamEntries() {
//     this.boxscore.teams.forEach((team: EspnTeam) => {
//       const { id, location, nickname, logo } = team;
//       const { wins, losses } = team.record.overall;

//       const teamName = [location, nickname].join(' ');

//       if (!this.checksIfTaxi(id)) {
//         this.teams[String(id)] = {
//           ...TeamStarter,
//           teamName,
//           id,
//           logo,
//           records: {
//             ...TeamStarter.records,
//             myWeekly: { wins, losses }
//           }
//         }
//       }
//     });
//   }

//   private createMatchupEntry(variables: TeamVariables) {
//     const { awayId, awayPoints, homeId, homePoints, matchupPeriodId } = variables;

//     const awayInfo = { teamId: awayId, score: awayPoints, opponentId: homeId };
//     const homeInfo = { teamId: homeId, score: homePoints, opponentId: awayId };

//     if (!this.matchups[`${matchupPeriodId}`]) {
//       this.matchups[`${matchupPeriodId}`] = [];
//     }

//     this.matchups[`${matchupPeriodId}`].push(awayInfo, homeInfo);
//   }

//   handleSetup() {
//     this.boxscore.schedule.forEach((matchup) => {
//       const { away, home, matchupPeriodId } = matchup;

//       const weekId: string = matchupPeriodId as string;

//       const isWeekFinished = matchupPeriodId < this.currentWeek;

//       if (away && home && !this.checksIfTaxi(home.teamId)) {

//         const variables = this.createTeamVariables(matchup);

//         this.createMatchupEntry(variables);
//         // this.setSchedule(variables);
        
//         if (isWeekFinished && this.matchups[weekId].length === 10) {
//           this.setWeeklyRank(weekId);
//           // this.setMedianRecords(weekId);
//           // this.setRecordInTime(matchup);
//         }
//       }
//     });
//   }


//   setRecords() {
//     console.log('set records');
//     // this.setMedianRecords();
//     // console.log(this.teams['1'].records.myMedian);
    
//     // this.setCombinedRecords();
//     // this.setOpponentsRecords();
//     // this.setFutureRecords();
//   }

//   setAllPlayMap() {
//     const teams = Object.keys(this.teams).length;
//     const map = createAllPlayMap(Object.keys(this.teams).length);
//     this.allPlayMap = map;
//   }

//   setAllPlayRecords() {
//     Object.keys(this.teams).forEach((teamId: string) => {
//       const team = this.teams[teamId];

//       // console.log(team.weeklyRank);
      

//       for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//         team.records.myAllPlay[`${weekId}`] = this.allPlayMap[`${team.weeklyRank[`${weekId}`]}`]
//       }
//     })

//     // for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//     //   const week = this.matchups[`${weekId}`];

//     //   week.forEach((scorecard, index) => {
        
//     //     const rank = index + 1;
//     //     const record = this.allPlayMap[`${rank}`];
//     //     console.log(scorecard, rank, record, weekId);
//     //     const { teamId } = scorecard;
//     //     this.teams[teamId].records.myAllPlay[`${weekId}`] = this.allPlayMap[`${rank}`]
//     //     console.log(this.teams[teamId].records.myAllPlay[`${weekId}`] === this.allPlayMap[`${rank}`])        
//     //   })

//     // }
//   }

//   private setMedianRecords(weekId: string) {
//     const matchups = this.matchups[`${weekId}`];

//     this.sortMatchups(matchups);

//     const middleIndex = Math.ceil(matchups.length / 2)

//     // matchups.forEach((scorecard, index) => {
//     //   const rank = index + 1;
//     //   const { teamId } = scorecard;

//     //   const team = this.teams[`${teamId}`]
      
//     //   if (rank <= middleIndex) {
//     //     console.log(weekId, rank, middleIndex, teamId);
//     //     team.records.myMedian.wins += 1;
//     //   }
//     // })

//     for (let i = 0; i < middleIndex; i++) {
//       const scorecard = matchups[i];
//       const { teamId } = scorecard;

//       const prev = this.teams[`${teamId}`].records.myMedian

//       // console.log(this.teams[`${teamId}`].teamName, { prev });
      

//       this.teams[`${teamId}`].records.myMedian.wins += 1;
//     }
    

//     // for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//     //   const matchups = this.matchups[`${weekId}`];
      
//     //   this.sortMatchups(matchups);
      
//     //   const middleIndex = Math.ceil(matchups.length / 2);
      
//     //   matchups.forEach((matchup, index: number) => {
//     //     const { teamId } = matchup;

//     //     const rank = index + 1;
//     //     if (rank <= 5) {
//     //        this.teams[`${teamId}`].records.myMedian.wins += 1;
//     //     }
//     //   })
      
//     // }

//     // for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//     //   const week = this.matchups[String(weekId)];

//     //   this.sortMatchup(week);
//     //   const middleIndex = Math.ceil(week.length / 2);

//     //   // week.forEach((scorecard, index) => {
        
//     //   //   const { teamId } = scorecard;
//     //   //   const rank = index + 1;
        
//     //   //   if (rank <= middleIndex) {
//     //   //     this.teams[teamId].records.myMedian.wins += 1;
//     //   //     console.log(teamId, this.teams[teamId].records);
//     //   //   }
//     //   //   // if (rank <= middleIndex) {
//     //   //   // } else {
//     //   //   //   this.teams[String(teamId)].records.myMedian.losses += 1;
//     //   //   // }
//     //   // })
      
//     //   // const topHalf = week.slice().splice(0, middleIndex);
//     //   // const bottomHalf = week.slice().splice(-middleIndex);
      
//     //   // topHalf.forEach((scorecard) => {
//     //   //   const { teamId } = scorecard;
//     //   //   this.teams[`${teamId}`].records.myMedian.wins += 1;
//     //   // });

//     //   // bottomHalf.forEach((scorecard) => {
//     //   //   const { teamId } = scorecard;
//     //   //   this.teams[`${teamId}`].records.myMedian.losses += 1;
//     //   // });
//     // }
//   }

//   private setCombinedRecords() {
//     Object.keys(this.teams).forEach((id: string) => {
//       const team = this.teams[id];
//       const { myWeekly, myMedian } = team.records;
//       const combined = {
//         wins: myWeekly.wins + myMedian.wins,
//         losses: myWeekly.losses + myMedian.losses,
//       };

//       team.records.myCombined = combined;
//     });
//   }

//   setRecordInTime(info) {
//     const { away, home, matchupPeriodId } = info;

//     const awayId = String(away.teamId);
//     const homeId = String(home.teamId);

//     const awayPrev = {
//       wins: this.teams[awayId].records.myCumulative[`${matchupPeriodId - 1}`].wins,
//       losses: this.teams[awayId].records.myCumulative[`${matchupPeriodId - 1}`].losses,
//     }

//     const homePrev = {
//       wins: this.teams[homeId].records.myCumulative[`${matchupPeriodId - 1}`].wins,
//       losses: this.teams[homeId].records.myCumulative[`${matchupPeriodId - 1}`].losses,
//     }

//     this.teams[awayId].records.myCumulative[`${matchupPeriodId}`] = { wins: awayPrev.wins, losses: awayPrev.losses };

//     this.teams[homeId].records.myCumulative[`${matchupPeriodId}`] = { wins: homePrev.wins, losses: homePrev.losses };

//     // console.log(homePrev);

//     // if (away.totalPoints > home.totalPoints) {
//     //   console.log('top: ', away.totalPoints, home.totalPoints)
//     //   this.teams[awayId].records.myCumulative[`${matchupPeriodId}`].wins += 1; 
//     //   this.teams[homeId].records.myCumulative[`${matchupPeriodId}`].losses += 1; 
//     // } else {
//     //   console.log('bottom: ', away.totalPoints, home.totalPoints)
//     //   this.teams[homeId].records.myCumulative[`${matchupPeriodId}`].wins += 1; 
//     //   this.teams[awayId].records.myCumulative[`${matchupPeriodId}`].losses += 1; 
//     // }

//     // const awayTeam = this.teams[`${awayId}`];
//     // const homeTeam = this.teams[`${homeId}`];

//     // const awayPrevWins = awayTeam.records.myCumulative[`${matchupPeriodId - 1}`].wins;
//     // const awayPrevLosses = awayTeam.records.myCumulative[`${matchupPeriodId - 1}`].losses;
    
//     // const homePrevWins = homeTeam.records.myCumulative[`${matchupPeriodId - 1}`].wins;
//     // const homePrevLosses = homeTeam.records.myCumulative[`${matchupPeriodId - 1}`].losses;
    
//     // console.log(awayTeam.teamName, awayPrevWins, awayPrevLosses);

//     // awayTeam.records.myCumulative[`${matchupPeriodId}`] = {} as WinLoss;
//     // homeTeam.records.myCumulative[`${matchupPeriodId}`] = {} as WinLoss;
    
//     // awayTeam.records.myCumulative[`${matchupPeriodId}`].wins = awayPrevWins;
//     // awayTeam.records.myCumulative[`${matchupPeriodId}`].losses = awayPrevLosses;

//     // homeTeam.records.myCumulative[`${matchupPeriodId}`].wins = homePrevWins;
//     // homeTeam.records.myCumulative[`${matchupPeriodId}`].losses = homePrevLosses;

//     // console.log(awayTeam.records.myCumulative[`${matchupPeriodId}`]);
    
    
//     // // awayTeam.records.myCumulative[`${matchupPeriodId}`] = { wins: awayPrevWins, losses: awayPrevLosses };
//     // // homeTeam.records.myCumulative[`${matchupPeriodId}`] = { wins: homePrevWins, losses: homePrevLosses };

//     // if (away.totalPoints > home.totalPoints) {
//     //   awayTeam.records.myCumulative[`${matchupPeriodId}`].wins += 1;
//     //   homeTeam.records.myCumulative[`${matchupPeriodId}`].losses += 1;
//     // } else {
//     //   homeTeam.records.myCumulative[`${matchupPeriodId}`].wins += 1;
//     //   awayTeam.records.myCumulative[`${matchupPeriodId}`].losses += 1;
//     // }
//   }

//   setOpponentsRecords() {
//     Object.keys(this.teams).forEach((teamId: string) => {
//       const team = this.teams[teamId];
//       const { schedule } = team;
//       for (let weekId = 1; weekId < this.currentWeek; weekId++) {
//         const opponentId = schedule[weekId];
//         const opponent = this.teams[`${opponentId}`].records;

//         team.records.pastOpponents.weekly.wins += opponent.myWeekly.wins;
//         team.records.pastOpponents.weekly.losses += opponent.myWeekly.losses;

//         team.records.pastOpponents.median.wins += opponent.myMedian.wins;
//         team.records.pastOpponents.median.losses += opponent.myMedian.losses;

//         team.records.pastOpponents.combined.wins += opponent.myCombined.wins;
//         team.records.pastOpponents.combined.losses += opponent.myCombined.losses;
//       }
//     });
//   }

//   setFutureRecords() {
//     Object.keys(this.teams).forEach((teamId: string) => {
//       const team = this.teams[teamId];
//       const { schedule } = team;
//       for (let weekId = this.currentWeek; weekId <= 14; weekId++) {
//         const opponentId = schedule[weekId];
//         const opponent = this.teams[`${opponentId}`].records;

//         team.records.futureOpponents.weekly.wins += opponent.myWeekly.wins;
//         team.records.futureOpponents.weekly.losses += opponent.myWeekly.losses;

//         team.records.futureOpponents.median.wins += opponent.myMedian.wins;
//         team.records.futureOpponents.median.losses += opponent.myMedian.losses;

//         team.records.futureOpponents.combined.wins += opponent.myCombined.wins;
//         team.records.futureOpponents.combined.losses +=
//           opponent.myCombined.losses;
//       }
//     });
//   }

//   private sortMatchups(
//     matchups: { teamId: number; score: number; opponentId: number }[]
//   ) {
//     // removed the return....
//     matchups.sort((a, b) => b.score - a.score);
//   }

//   private async getBoxscore(): Promise<EspnBoxscore> {
//     const response = await fetchUrl(this.boxscoreUrl);
//     return response.data;
//   }

//   private async setBoxscore() {
//     const boxscore = await this.getBoxscore();
//     console.log({boxscore});
    
//     this.boxscore = boxscore;
//   }

//   private checksIfTaxi(value: string | number) {
//     switch (typeof value) {
//       case 'string':
//         return value === 'TAXI' || value === 'TM13';
//       case 'number':
//         const taxiIds = [11, 12, 13];
//         return taxiIds.includes(value);
//       default:
//         break;
//     }
//   }

//   private createTeamVariables(matchup): TeamVariables {
//     const { matchupPeriodId } = matchup;

//     const inclusions = ['home', 'away'];
//     const variables = {} as TeamVariables;

//     const keys = Object.keys(matchup);

//     keys.forEach((key: string) => {
//       if (inclusions.includes(key)) {
//         const score = matchup[key];
//         const { totalPoints, teamId } = score;
//         const team = this.teams[`${teamId}`];

//         variables[key + 'Team'] = team;

//         variables[key + 'Points'] = totalPoints;
//         variables[key + 'Id'] = teamId;

//         variables[key + 'Wins'] = team.records.myWeekly.wins;
//         variables[key + 'Losses'] = team.records.myWeekly.losses;
//         variables[key + 'MedianWins'] = team.records.myMedian.wins;
//         variables[key + 'MedianLosses'] = team.records.myMedian.losses;
//         variables[key + 'CombinedWins'] = team.records.myCombined.wins;
//         variables[key + 'CombinedLosses'] = team.records.myCombined.losses;

//         const prevMatchup = team.records.myCumulative[`${matchupPeriodId - 1}`];

//         if (prevMatchup) {
//           variables[key + 'PrevWins'] = prevMatchup.wins;
//           variables[key + 'PrevLosses'] = prevMatchup.losses;
//         }

//         variables[key + 'OpponentWins'] = team.records.pastOpponents.weekly.wins;
//         variables[key + 'OpponentLosses'] =
//           team.records.pastOpponents.weekly.losses;
//         variables[key + 'OpponentMedianWins'] =
//           team.records.pastOpponents.median.wins;
//         variables[key + 'OpponentMedianLosses'] =
//           team.records.pastOpponents.median.losses;
//         variables[key + 'OpponentCombinedWins'] =
//           team.records.pastOpponents.combined.wins;
//         variables[key + 'OpponentCombinedLosses'] =
//           team.records.pastOpponents.combined.losses;

//         variables[key + 'FutureWins'] =
//           team.records.futureOpponents.weekly.wins;
//         variables[key + 'FutureLosses'] =
//           team.records.futureOpponents.weekly.losses;

//         variables[key + 'FutureMedianWins'] =
//           team.records.futureOpponents.median.wins;
//         variables[key + 'FutureMedianLosses'] =
//           team.records.futureOpponents.median.losses;

//         variables[key + 'FutureCombinedWins'] =
//           team.records.futureOpponents.combined.wins;
//         variables[key + 'FutureCombinedLosses'] =
//           team.records.futureOpponents.combined.losses;
//       } else {
//         variables[key] = matchup[key];
//       }
//     });

//     return variables;
//   }
// }
