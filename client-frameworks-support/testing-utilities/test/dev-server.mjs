import { startSimpleServer } from '../../../scripts/tools/simple-server/index.mjs';

startSimpleServer({
  port: 8181,
  root: '.',
  mounts: [['/node_modules', './node_modules']],
  reload: false
});
