import { build } from 'vite';
import liveServer from 'live-server';
import fs from 'fs-extra';

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

build({
  build: {
   watch: {}
 }
 });

var params = {
  port: 4400,
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
