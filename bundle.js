const { exec } = require('child_process');

// Array of folder names
const foldersToBundle = [
  'core',
  'core-modular',
  'client',
  'client-frameworks-support/testing-utilities',
  'client-frameworks-support/client-support-angular',
  'client-frameworks-support/client-support-ui5',
  'container',
  'plugins'
];

const foldersToBuild = ['test/e2e-test-application'];

let timeToBundle = 0;
let timeToBuild = 0;

// Check for verbose flag
const verboseFlagIndex = process.argv.indexOf('--verbose');
let isVerbose = verboseFlagIndex !== -1;

// Function to run 'npm run <operation>' in a folder
function runCommand(folder, index, totalFolders, operation) {
  const startTime = new Date();

  return new Promise((resolve, reject) => {
    const command = `cd ${folder} && npm run ${operation}`;

    exec(command, (error, stdout, stderr) => {
      const endTime = new Date();
      const elapsedTime = (endTime - startTime) / 1000;
      timeToBundle += operation === 'bundle' ? elapsedTime : 0;
      timeToBuild += operation === 'build' ? elapsedTime : 0;

      if (error) {
        console.error(`\x1b[31mError when trying to ${operation} packages in ${folder} \x1b[0m`);
        reject(error);
      } else {
        console.log(
          `\x1b[36m[${index +
            1}/${totalFolders}]\x1b[0m: \x1b[33m${folder}\x1b[0m ${operation} successful (\x1b[33m${elapsedTime.toFixed(
            2
          )}s\x1b[0m)`
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

// Function to run 'npm run bundle' in all specified folders
async function runCommandInAllFolders(folders, operation) {
  console.log(
    `\x1b[36m\n\nRunning (npm run ${operation}) in these folders in the following order:\x1b[0m ${
      isVerbose ? '\x1b[41m\x1b[37m(VERBOSE)\x1b[0m' : ''
    }`
  );
  for (const folder of folders) {
    console.log('- ' + folder);
  }

  for (let i = 0; i < folders.length; i++) {
    console.log(`\n\x1b[37m${operation} \x1b[33m${folders[i]}\x1b[0m ...`);
    await runCommand(folders[i], i, folders.length, operation);
  }
}

// Run the 'npm run bundle' command in the specified folders
runCommandInAllFolders(foldersToBundle, 'bundle').then(() => {
  console.log(`Bundle finished in ${timeToBundle.toFixed(2)}s`);

  // Run the 'npm run build' command in the specified folders
  runCommandInAllFolders(foldersToBuild, 'build').then(() => {
    console.log(`Build finished in ${timeToBuild.toFixed(2)}s\n`);
    console.log(`\nBuild+Bundle finished in ${(timeToBuild + timeToBundle).toFixed(2)}s\n`);
  }, errorHandler);
}, errorHandler);

/**
 * Function to handle the error case for promises
 * @param {*} error error
 */
function errorHandler(error) {
  console.error('Stopping execution of the process due to error:', error);
  process.exit(1);
}
