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
import semver from 'semver';
import prompts from 'prompts';
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
const base = path.resolve(__dirname, '..', '..', '..');
const pkgJsonPaths = {
  core: path.resolve(base, 'core', 'public', 'package.json'),
  core_public_root: path.resolve(base, 'core', 'public_root', 'package.json'),
  client: path.resolve(base, 'client', 'public', 'package.json'),
  authOAuth2: path.resolve(base, 'plugins', 'auth', 'public', 'auth-oauth2', 'package.json'),
  authOIDC: path.resolve(base, 'plugins', 'auth', 'public', 'auth-oidc', 'package.json'),
  testing_utilities: path.resolve(base, 'client-frameworks-support', 'testing-utilities', 'dist', 'package.json'),
  testing_utilities_src: path.resolve(base, 'client-frameworks-support', 'testing-utilities', 'package.json')
};
const installPaths = {
  core: path.resolve(base, 'core'),
  client: path.resolve(base, 'client'),
  plugins: path.resolve(base, 'plugins'),
  testing_utilities: path.resolve(base, 'client-frameworks-support', 'testing-utilities')
};

if (process.env.NIGHTLY === 'true' && !process.env.NIGHTLY_VERSION) {
  pkgJsonPaths.container = path.resolve(base, 'container', 'public', 'package.json');
  installPaths.container = path.resolve(base, 'container');
}

/**
 * FNS
 */
async function getReleases() {
  const response = await fetch('https://api.github.com/repos/luigi-project/luigi/releases', {
    headers: {
      'User-Agent': 'Luigi Release CLI'
    }
  });
  if (!response?.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.map((r) => r.tag_name).filter((_, i) => i <= 8);
}

function getVersion(pkg) {
  return require(pkgJsonPaths[pkg]).version;
}

function getNextVersion() {
  return semver.inc(getVersion('core'), 'patch');
}

/**
 * getVersionSuffix generates version suffix to make it unique
 * @returns {string} Unique version suffix
 */
function getVersionSuffix() {
  const padLeft = (str, inp) => {
    return str.substring(0, str.length - inp.toString().length) + inp.toString();
  };
  const currentDatetime = new Date();
  const formattedDate = `${currentDatetime.getFullYear()}${padLeft(
    '00',
    currentDatetime.getMonth() + 1
  )}${currentDatetime.getDate()}${padLeft('00', currentDatetime.getHours())}${padLeft(
    '00',
    currentDatetime.getMinutes()
  )}`;

  return '-dev.' + formattedDate;
}

function writeVersion(packagePath, version) {
  const pkgjson = require(packagePath);
  pkgjson.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(pkgjson, null, 2));
}

/**
 * addToChangelog appends the changelog and lastline if it does not exist yet
 * @param {string} versionText the v1.0.0 version string to check if it exists already
 * @param {string} changelog multiline changelog markdown
 * @param {string} lastline version comparison github link
 */
function addToChangelog(versionText, changelog, lastline) {
  const changelogFile = path.resolve(base, 'CHANGELOG.md');
  let md = fs.readFileSync(changelogFile).toString();
  if (md.indexOf(versionText) !== -1) {
    logWarning('WARNING: Version already exist in the changelog, not appending.');
    return;
  }
  // remove committers from changelog

  // add changelog text
  md = md.replace('-->', `-->\n\n${changelog}\n\n`);
  // add github compare link
  md = md += `\n${lastline}`;
  fs.writeFileSync(changelogFile, md);
  logHeadline('Appended changelog');
}

/**
 * PROMPT
 */

(async () => {
  logHeadline('Preparing new release.');

  const releases = await getReleases();
  const nextVersion = getNextVersion();

  // NIGHTLY BUILD
  if (process.env.NIGHTLY === 'true') {
    if (process.env.NIGHTLY_VERSION && process.env.NIGHTLY_VERSION.indexOf('-rc') > 0) {
      logHeadline('\nFound custom version in env: ' + process.env.NIGHTLY_VERSION);
      prompts.inject([process.env.NIGHTLY_VERSION, false]);
    } else {
      const versionSuffix = getVersionSuffix();
      prompts.inject([nextVersion + versionSuffix, false]);
    }
  }

  const questions = [
    {
      type: 'text',
      name: 'version',
      message: 'Version you want to release (current: ' + getVersion('core') + ')?',
      validate: (str) => (semver.valid(str) ? true : 'Invalid version (no valid semver)'),
      initial: nextVersion
    },
    {
      type: 'confirm',
      name: 'changelog',
      message: 'Generate the changelog?',
      initial: true
    },
    {
      type: (prev) => (prev == true ? 'select' : null),
      name: 'prevVersion',
      message: 'Previous version to generate from?',
      choices: releases
    }
  ];

  const input = await prompts(questions);

  /**
   * PACKAGE VERSIONS
   */
  for (const name of Object.keys(pkgJsonPaths)) {
    let inputVersion = input.version;

    // handle custom container version for nightly release
    if (name === 'container' && process.env.NIGHTLY === 'true') {
      const containerNightlyVersion = getVersion('container');
      const versionSuffix = getVersionSuffix();

      inputVersion = containerNightlyVersion + versionSuffix;
      logHeadline('\nContainer updated to v' + inputVersion + ':');
    }

    writeVersion(pkgJsonPaths[name], inputVersion);
  }
  logHeadline('\nPackages updated to v' + input.version + ':');
  logStep(Object.keys(pkgJsonPaths).join(', '));

  /**
   * CHANGELOG
   */
  if (input.changelog) {
    const prevVersion = releases[input.prevVersion];
    const versionText = '## [v' + input.version + ']';
    let changelog = require('child_process')
      .execSync(base + '/node_modules/lerna-changelog/bin/cli.js --ignoreCommiters --from ' + prevVersion)
      .toString()
      .replace('## Unreleased', versionText);

    // strip committers part
    changelog = changelog.slice(0, changelog.indexOf('#### Committers'));

    const lastline = `[v${input.version}]: https://github.com/luigi-project/luigi/compare/${prevVersion}...v${input.version}`;

    logHeadline('\nPrepared Changelog:');
    console.log(changelog);

    logHeadline('\nChangelog last line:\n');
    console.log(lastline);
    logStep('\n');

    const changelogQuestions = [
      {
        type: 'confirm',
        name: 'prepend',
        message: 'Prepend it to the changelog.md?',
        initial: true
      }
    ];
    const changeloginput = await prompts(changelogQuestions);
    if (changeloginput.prepend) {
      addToChangelog(versionText, changelog, lastline);
    }
  } // end if changelog

  /**
   * UPDATE PACKAGE-LOCKS
   * Skip when running in ci for nightly.
   */
  if (process.env.NIGHTLY !== 'true') {
    logHeadline('\nInstalling packages to update package-lock.json');
    for (const key in installPaths) {
      logStep(`Installing ${key}`);
      require('child_process').execSync(`cd ${installPaths[key]} && npm install`, { stdio: [0, 1, 2] });
    }
    logHeadline('Package-lock.json files updated.\n');
  }

  logHeadline('\nRelease prepared!');

  if (process.env.NIGHTLY === 'true') {
    console.log(color.bold(`\nNow execute: npm run release:nightly`));
  } else {
    console.log(
      color.bold(`\nThen continue with the following steps:
    1. Run: ./tools/release-cli/replaceInAllFiles.sh "NEXTRELEASE" "${input.version}"
    2. Check and modify CHANGELOG.md entries
    3. Add and commit changed files
    4. Follow the rest of our internal release documentation
    `)
    );
  }
})();
