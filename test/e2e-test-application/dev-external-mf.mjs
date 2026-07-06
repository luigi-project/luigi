import { startSimpleServer } from '../../scripts/tools/simple-server/index.mjs';

startSimpleServer({
  port: 8090,
  root: './externalMf',
  watch: ['./externalMf']
});
