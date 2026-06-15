const fs = require('fs');
const readline = require('readline');
const packageJson = require('./projects/client-support-angular/package.json');
const color = require('cli-color');

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_OWNER = 'luigi-project';
const GITHUB_REPO = 'luigi';
const GITHUB_TOKEN = process.env.GITHUB_AUTH;

const NPM_PACKAGE_NAME = '@luigi-project/client-support-angular';
const TAG_PREFIX = 'client-support-angular/v';
const PR_LABEL = 'client-support-lib-angular';

const listReleases = async () => {
  try {
    const url = `${GITHUB_API_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};

const getNpmPublishDate = async (version) => {
  try {
    const response = await fetch(`https://registry.npmjs.org/${NPM_PACKAGE_NAME}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return data.time[version] || null;
  } catch (error) {
    console.error('Cannot fetch npm publish date:', error.message);
    return null;
  }
};

const listPullRequests = async (params) => {
  let allPulls = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const queryString = new URLSearchParams({ ...params, per_page: perPage, page }).toString();
      const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?${queryString}`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      allPulls = allPulls.concat(data);

      if (data.length < perPage) {
        break;
      }
      page++;
    }

    return allPulls;
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};

const logWarning = (str) => console.log(color.yellow.bold(str));
const logSuccess = (str) => console.log(color.green.bold(str));
const logError = (str) => console.log(color.redBright.bold(str));

async function getAngularReleases() {
  try {
    const releases = await listReleases();
    if (!Array.isArray(releases)) {
      console.error('Releases is not an array');
      return [];
    }

    const angularReleases = releases.filter((release) => release.tag_name.startsWith(TAG_PREFIX));
    return angularReleases;
  } catch (error) {
    console.error('Can not fetch client-support-angular releases.', error.message);
    return [];
  }
}

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  let month = (currentDate.getMonth() + 1).toString();
  let day = currentDate.getDate().toString();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return `${year}-${month}-${day}`;
}

function updateVersionInPkgJson(version) {
  packageJson.version = version;
  fs.writeFileSync('./projects/client-support-angular/package.json', JSON.stringify(packageJson, null, 2));
  logSuccess('Updated projects/client-support-angular/package.json');
}

function formatPullRequests(pullRequests) {
  return pullRequests
    .map((pr) => `* [#${pr.number}](${pr.html_url}) ${pr.title} ([@${pr.user.login}](${pr.user.html_url}))`)
    .join('\n');
}

function categorizePullRequests(pullRequests, publishedAt) {
  const categorizedPulls = {
    breakingPulls: [],
    enhancementPulls: [],
    bugPulls: [],
    noLabelPulls: []
  };

  pullRequests.forEach((pr) => {
    const labels = pr.labels.map((label) => label.name);

    if (labels.includes(PR_LABEL) && pr.merged_at > publishedAt) {
      if (labels.includes('breaking')) {
        categorizedPulls.breakingPulls.push(pr);
      } else if (labels.includes('bug')) {
        categorizedPulls.bugPulls.push(pr);
      } else if (labels.includes('enhancement')) {
        categorizedPulls.enhancementPulls.push(pr);
      } else {
        categorizedPulls.noLabelPulls.push(pr);
      }
    }
  });

  return categorizedPulls;
}

async function prepareRelease() {
  const angularReleases = await getAngularReleases();
  const lastRelease = angularReleases[0];

  if (!lastRelease) {
    logError('No previous client-support-angular release found on GitHub.');
    logError(`Please create an initial GitHub release with tag "${TAG_PREFIX}<version>" first.`);
    return;
  }

  const currentVersion = lastRelease.tag_name.replace(TAG_PREFIX, '');
  const publishedAt = await getNpmPublishDate(currentVersion);

  if (!publishedAt) {
    logWarning(`Could not find npm publish date for version ${currentVersion}. Using GitHub release date as fallback.`);
  }

  const filterDate = publishedAt || lastRelease.published_at;
  console.log(`Last release: ${currentVersion} (published: ${filterDate})\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = color.bold.cyan(`Version you want to release (current version ${currentVersion})? `);

  rl.question(question, async (version) => {
    if (packageJson.version >= version) {
      logWarning('Version already exists. Please check.');
      rl.close();
      return;
    } else if (version.startsWith('v')) {
      logWarning('Please type only a number, e.g. 22.1.0');
      rl.close();
      return;
    }

    updateVersionInPkgJson(version);

    try {
      const pullRequests = await listPullRequests({ state: 'closed' });
      const { breakingPulls, enhancementPulls, bugPulls, noLabelPulls } = categorizePullRequests(
        pullRequests,
        filterDate
      );
      const breakingChanges = formatPullRequests(breakingPulls);
      const enhancementChanges = formatPullRequests(enhancementPulls);
      const bugChanges = formatPullRequests(bugPulls);
      const noLabelChanges = formatPullRequests(noLabelPulls);

      const changelogPath = './CHANGELOG.md';

      const lastline = `\n[v${version}]: https://github.com/luigi-project/luigi/compare/${lastRelease.tag_name}...${TAG_PREFIX}${version}`;

      fs.readFileSync(changelogPath, 'utf8');
      fs.appendFileSync(changelogPath, lastline, 'utf8');

      const newChangelog = `\n\n## [v${version}] (${getCurrentDate()})\n\n${
        breakingChanges ? `#### ":boom: Breaking Change"\n${breakingChanges}\n\n` : ''
      }${enhancementChanges ? `#### :rocket: Added\n\n${enhancementChanges}\n\n` : ''}${
        bugChanges ? `#### :bug: Fixed\n\n${bugChanges}\n\n` : ''
      }${noLabelChanges ? `#### :internal: Issue with no label\n\n${noLabelChanges}\n` : ''}`;

      fs.readFile(changelogPath, 'utf8', (err, data) => {
        if (err) {
          logError('Cannot read file when trying to add release to changelog file:', err);
          return;
        }

        const searchText = '<!--Generate the changelog using release cli. -->';

        if (data.includes(searchText)) {
          const newData = data.replace(searchText, `${searchText}\n\n${newChangelog}`);
          fs.writeFile(changelogPath, newData, 'utf8', (err) => {
            if (err) {
              logError('Cannot write data to file:', err);
              return;
            }
          });
        } else {
          logError('The searchText (comment) was not found in CHANGELOG file.');
          return;
        }
      });

      logSuccess('Changelog updated successfully!');

      console.log(
        color.bold(`\nThen continue with the following steps:
              1. Check and modify CHANGELOG.md entries
              2. Add and commit changed files
              3. Follow the rest of our internal release documentation
              `)
      );
    } catch (error) {
      logError('Error generating changelog:', error);
    }
    rl.close();
  });
}

prepareRelease();
