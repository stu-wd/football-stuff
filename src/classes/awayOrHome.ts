export class AwayOrHome {

    variables: Record<string, number> = {};
    private teams: string[] = ['away', 'home'];

    constructor(matchup: Record<string, any>) {
        const keys = Object.keys(matchup);
        
        keys.forEach((key: string) => {
            if (this.teams.includes(key)) {
                const score = matchup[key];
                const { totalPoints, teamId } = score;
                this.variables[key + 'Points'] = totalPoints;
                this.variables[key + 'Id'] = teamId;
            } else {
                this.variables[key] = matchup[key];
            }
        }) 
    }

}