import { startSimpleServer } from '../../scripts/tools/simple-server/index.mjs';

startSimpleServer({
  port: 4000,
  root: './public',
  single: true
});
