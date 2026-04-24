import { watch } from 'rollup';
import liveServer from 'live-server';
import fs from 'fs-extra';
import config from '../rollup.config.mjs';

const logo_ascii = `
                              //
                        /////   /////
                   /////             /////
              /////                       /////
         ////                                   ////
      //                                            *//
     //                        ////                   //
     //                     ////////                  //
    //                    ////////   ///               //
    //                 ////////   ////////             //
   //                ////////   ////////   //           //
  //              ////////   ////////    ///////        ///
  //            ////////   ////////   ////////           //
 //          ////////   ////////    ////////              //
 //            ////////   ////   ////////                 //
 //              ////////      ////////                   //
  ///               ////////   /////                    ///
    ///               ////////                         ///
      ///                //////                     ///
        ///                //                     ///
          ///                                   ///
            ///                               ///
              ///                           ///
                /////////////////////////////




        ///                    ///               ///
        ///
        ///        ///    ///  ///   ////////    ///
        ///        ///    ///  ///   ///   ///   ///
        ///        ///    ///  ///    /////      ///
        /////////  ////// ///  ///   /////////   ///
                                    ///     ///
                                      //////

`;
console.log('\x1b[32m', logo_ascii, '\x1b[0m');

const rootPath = './dev-tools/simple-app';
const indexPath = rootPath + '/index.html';
try {
  if (fs.existsSync(indexPath)) {
    console.log('\x1b[32mFound ' + indexPath, '\x1b[0m');
  } else {
    console.log(
      '\x1b[33mCould not find ' + indexPath,
      '\nInitializing new minimalistic Luigi app from template...',
      '\x1b[0m'
    );
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath);
    }
    fs.copy('./dev-tools/templates/simple', rootPath);
    console.log('\x1b[32mNew Luigi app created under ' + rootPath, '\x1b[0m');
  }
} catch (err) {
  console.error(err);
}

// Start Rollup in watch mode
const watcher = watch(config);

watcher.on('event', event => {
  if (event.code === 'START') {
    console.log('\x1b[36mRollup: Starting build...\x1b[0m');
  } else if (event.code === 'BUNDLE_END') {
    console.log('\x1b[32mRollup: Build completed\x1b[0m');
  } else if (event.code === 'ERROR') {
    console.error('\x1b[31mRollup build error:\x1b[0m', event.error);
  }
});

var params = {
  port: 4100,
  host: '0.0.0.0',
  root: rootPath,
  open: false,
  watch: ['./dev-tools', '../client/public'],
  file: 'index.html',
  wait: 1000,
  mount: [
    ['/public', './public'],
    ['/public_client', '../client/public']
  ],
  logLevel: 0,
  cors: true
};

liveServer.start(params);
console.log('\x1b[32mStarting live-server at', '\x1b[36m', 'http://localhost:' + params.port, '\x1b[0m');
