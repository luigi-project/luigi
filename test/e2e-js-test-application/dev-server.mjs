import { startSimpleServer } from '../../scripts/tools/simple-server/index.mjs';

startSimpleServer({
  port: 4500,
  root: './public',
  mounts: [['/node_modules', './node_modules']],
  watch: ['./public']
});
