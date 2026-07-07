import { startSimpleServer } from '../../scripts/tools/simple-server/index.mjs';

startSimpleServer({
  port: 3000,
  root: './public',
  mounts: [['/node_modules', './node_modules']],
  reload: false
});
