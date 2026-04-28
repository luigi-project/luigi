/**
 * Usage:
 * cd scripts
 * npm run release
 *
 * or for nightly build, to just update patch version without changelog:
 * NIGHTLY=true npm run release
 */

import fs from 'fs';
import path from 'path';

import color from 'cli-color';

/**
 * COLORS
 */
const logHeadline = (str) => console.log(color.bold.cyan(str));
const logWarning = (str) => console.log(color.yellow.bold(str));
const logError = (str) => console.log(color.redBright.bold(str));
const logStep = (s1, s2, s3) => {
  if (s3) {
    console.log(color.cyan(s1), color.cyan(s2), color.cyan(s3));
  } else if (s2) {
    console.log(color.cyan(s1), color.cyan(s2));
  } else if (s1) {
    console.log(color.cyan(s1));
  }
};

/**
 * PATHS
 */

const base = path.resolve(__dirname, '..', '..');

const packagePaths = {
  core: ['core'],
  client: ['client'],
  oauth2: ['plugins', 'auth', 'src', 'auth-oauth2'],
  oidc: ['plugins', 'auth', 'src', 'auth-oidc'],
  testing_utilities: ['client-frameworks-support', 'testing-utilities']
};
const publishPaths = {
  core: ['core', 'public'],
  client: ['client', 'public'],
  oauth2: ['plugins', 'auth', 'public', 'auth-oauth2'],
  oidc: ['plugins', 'auth', 'public', 'auth-oidc'],
  testing_utilities: ['client-frameworks-support', 'testing-utilities', 'dist']
};

if (!process.env.NIGHTLY_VERSION) {
  logHeadline('Added container, client_support_angular and headless path to publish nightly release steps');
  packagePaths.container = ['container'];
  publishPaths.container = ['container', 'public'];
  packagePaths.client_support_angular = ['client-frameworks-support', 'client-support-angular'];
  publishPaths.client_support_angular = [
    'client-frameworks-support',
    'client-support-angular',
    'dist',
    'client-support-angular'
  ];
  packagePaths.headless = ['core-modular'];
  publishPaths.headless = ['core-modular', 'public'];
}

function execTrim(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}

let LATEST_TAG = execTrim('git tag -l | tail -1');
if (!LATEST_TAG) {
  execTrim('git pull --tags --depth 500');
  LATEST_TAG = execTrim('git tag -l | tail -1');
  if (!LATEST_TAG) {
    throw 'Error fetching latest tag (raise depth?)';
  }
}
const FILES_CHANGED = execTrim(`git diff --name-only HEAD ${LATEST_TAG}`);

(async () => {
  logHeadline('Running nightly release.');
  const forcedRelease = !!process.env.NIGHTLY_VERSION;

  /**
   * Checks if files have been changed since last git tag.
   * @returns changed, a list of packagePaths keys
   */
  const changed = Object.entries(packagePaths).filter((val) => {
    return (
      forcedRelease ||
      FILES_CHANGED.split('\n').some((file) => {
        return file.indexOf(val[1].join('/')) !== -1;
      })
    );
  });

  if (changed.length === 0) {
    logHeadline('\nNothing to publish.');
  } else {
    logHeadline('\nPackages to publish:\n');
    const packagesToUpdate = Object.entries(packagePaths).map((c) => c[0]);
    logStep(packagesToUpdate.join(', '));
    logStep('\n');

    packagesToUpdate.forEach((pkg) => {
      const publicPath = `${base}/${publishPaths[pkg].join('/')}`;
      const pkgJson = require(publicPath + '/package.json');
      logStep(`Publishing ${pkgJson.name}@${pkgJson.version}`);
      const resultPublish = execTrim(`npm publish ${publicPath} --access public`);
      logStep(resultPublish);
      logStep('\n');
      const resultTagNext = execTrim(`npm dist-tag add ${pkgJson.name}@${pkgJson.version} next`);
      logStep(resultTagNext);
      logStep(`Tagged ${pkgJson.name}@${pkgJson.version} with next on npm`);
    });
  }
})();
