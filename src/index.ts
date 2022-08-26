#!/usr/bin/env node

import { getWeekMatchup } from './services/getPitcherTable';

await getWeekMatchup();

console.log('finished');
export { };