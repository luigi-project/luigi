/**
 * This file is used to run (npm install) in all of the folders which have it as a prerequisite in the pipeline and during local development
 */

const { exec } = require('child_process');

// Array of folder names
const folders = [
  './',
  'core',
  'core-modular',
  'client',
  'client-frameworks-support/client-support-angular',
  'client-frameworks-support/testing-utilities',
  'client-frameworks-support/client-support-ui5',
  'container',
  'plugins',
  'scripts',
  'test/e2e-test-application',
  'test/e2e-test-application/externalMf',
  'test/e2e-js-test-application',
  'test/e2e-client-api-test-app',
  'client-frameworks-support/testing-utilities/test'
];
// Check for verbose flag
const verboseFlagIndex = process.argv.indexOf('--verbose');
let isVerbose = verboseFlagIndex !== -1;

// Function to install npm packages in given folder
function installPackages(folder, index, totalFolders) {
  return new Promise((resolve, reject) => {
    const command = `cd ${folder} && npm install`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`\x1b[31mError installing npm packages in ${folder} \x1b[0m`);
        reject(error);
      } else {
        console.log(
          `\x1b[32m[${index + 1}/${totalFolders}] : npm packages installed successfully in \x1b[33m${folder}\x1b[0m`
        );
        // Print logs if needed
        if (isVerbose) {
          console.log('VERBOSE:', stdout);
        }
        resolve();
      }
    });
  });
}

// Function to install packages in all folders sequentially
async function installAllPackages() {
  for (let i = 0; i < folders.length; i++) {
    await installPackages(folders[i], i, folders.length);
  }
}

/**
 * Function to handle the error case for promises
 * @param {*} error error
 */
function errorHandler(error) {
  console.error('Stopping execution of the process due to error:', error);
  process.exit(1);
}

// EXECUTE CODE STARTS HERE

console.log(
  `\x1b[36m\n\nInstalling node_modules packages in these folders in the following order:\x1b[0m ${
    isVerbose ? '\x1b[41m\x1b[37m(VERBOSE)\x1b[0m' : ''
  }`
);
for (const folder of folders) {
  console.log('- ' + folder);
}

console.log('Starting ---------->');

installAllPackages().then(() => {
  console.log('\x1b[32m+++++++++++> Finished installing packages successfuly. <++++++++++++++++\x1b[0m\n');
}, errorHandler);
