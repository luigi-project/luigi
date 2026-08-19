const fs = require('fs');
const readline = require('readline');
const packageJson = require('./public/package.json');
const color = require('cli-color');

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_OWNER = 'luigi-project';
const GITHUB_REPO = 'luigi';
const GITHUB_TOKEN = process.env.GITHUB_AUTH;

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

const listPullRequests = async (params) => {
  const queryString = params ? new URLSearchParams(params).toString() : '';

  try {
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

    return data;
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};

const logWarning = (str) => console.log(color.yellow.bold(str));
const logSuccess = (str) => console.log(color.green.bold(str));
const logError = (str) => console.log(color.redBright.bold(str));

/**
 * Fetch the core modular releases and return them in an array
 * @returns array of releases
 */
async function getCoreModularReleases() {
  try {
    const releases = await listReleases();
    if (!Array.isArray(releases)) {
      console.error('Releases is not an array');
      return [];
    }

    const coreModularReleases = releases.filter((release) => release.tag_name.startsWith('core-modular/v'));

    return coreModularReleases;
  } catch (error) {
    console.error('Can not fetch core modular releases.', error.message);
    return [];
  }
}

/**
 * Get the current Date and return it in a yyy-mm-dd format for the header of a release in the changelog
 * @returns string with current date
 */
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

/**
 * Update package.json with new version
 * @param {*} version for the release
 */
function updateVersionInPgkJson(version) {
  packageJson.version = version;
  fs.writeFileSync('./public/package.json', JSON.stringify(packageJson, null, 4));
  logSuccess('Updated core-modular/public/package.json');
}

/**
 * Formats a list of pull requests into a Markdown-compatible string.
 * Each pull request is converted into a string containing the PR number,
 * title, and user information, all formatted as a Markdown list item.
 *
 * @param {Array} pullRequests - An array of pull request objects.
 * @returns {string} A formatted string with each pull request as a Markdown list item.
 */
function formatPullRequests(pullRequests) {
  return pullRequests
    .map((pr) => `* [#${pr.number}](${pr.html_url}) ${pr.title} ([@${pr.user.login}](${pr.user.html_url}))`)
    .join('\n');
}

/**
 * Categorizes a list of pull requests based on their labels and whether they have been merged since the last core modular release.
 *
 * @param {Array<Object>} pullRequests - An array of pull request objects to be categorized based on the label.
 * @param {Object} lastCoreModularRelease - An object representing the last core modular release.
 *
 * @returns {Object} An object containing four arrays that categorize the pull requests:
 *   - `breakingPulls`: An array of pull requests labeled as "breaking" changes.
 *   - `enhancementPulls`: An array of pull requests labeled as "enhancement".
 *   - `bugPulls`: An array of pull requests labeled as "bug".
 *   - `noLabelPulls`: An array of pull requests that are associated with the "headless-core" label but don't have any of the specific labels ("breaking", "enhancement", "bug"). Should be checked manually.
 */
function categorizePullRequests(pullRequests, lastCoreModularRelease) {
  const categorizedPulls = {
    breakingPulls: [],
    enhancementPulls: [],
    bugPulls: [],
    noLabelPulls: []
  };

  pullRequests.forEach((pr) => {
    const labels = pr.labels.map((label) => label.name);

    if (labels.includes('headless-core') && pr.merged_at > lastCoreModularRelease.published_at) {
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

function safeAppendFile(path, data) {
  try {
    // Check if data is valid string
    if (typeof data !== 'string' || data === '') {
      throw new Error('Data has to be valid string');
    }

    // Check against malicious patterns
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
      /on\w+\s*=/gi, // Inline event handlers (onclick, onload, etc.)
      /javascript:/gi, // JS protocol in links
      /document\./gi, // Access to document object
      /window\./gi, // Access to window object
      /eval\s*\(/gi, // eval() usage
      /Function\s*\(/gi, // Function constructor
      /setTimeout\s*\(/gi, // setTimeout with code string
      /setInterval\s*\(/gi // setInterval with code string
    ];

    if (maliciousPatterns.some((pattern) => pattern.test(data))) {
      throw new Error('Data is not safe');
    }

    // Limit data size to prevent DoS
    if (Buffer.byteLength(data, 'utf8') > 1024 * 1024) {
      // 1 MB limit
      throw new Error('Data is too large');
    }

    // Append data safely
    fs.appendFileSync(path, data, { encoding: 'utf8', flag: 'a' }, (err) => {
      console.log('Append lastline to Changelog', data);
      if (err) {
        logError('Cannot write compare link to the last line:', err);
        return;
      }
    });
  } catch (err) {
    console.error(`Error appending file: ${err.message}`);
  }
}

/**
 * Update package.json and add changes to changelog
 */
async function prepareRelease() {
  const lastCoreModularRelease = (await getCoreModularReleases())[0];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const currentVersion = lastCoreModularRelease?.tag_name?.replace('core-modular/v', '');
  const question = color.bold.cyan(`Version you want to release (current version ${currentVersion})?`);

  rl.question(question, async (version) => {
    if (compareVersions(packageJson.version, version) >= 0) {
      logWarning('Version already exists. Please check.');
      rl.close();
      return;
    } else if (version.startsWith('v')) {
      logWarning('Please type only a number, e.g. 1.3.0');
      rl.close();
      return;
    }

    updateVersionInPgkJson(version);

    try {
      const pullRequests = await listPullRequests({ state: 'closed' });
      const { breakingPulls, enhancementPulls, bugPulls, noLabelPulls } = categorizePullRequests(
        pullRequests,
        lastCoreModularRelease
      );
      const coreModularBreakingChanges = formatPullRequests(breakingPulls);
      const coreModularEnhancementChanges = formatPullRequests(enhancementPulls);
      const coreModularBugChanges = formatPullRequests(bugPulls);
      const coreModularNoLabelChanges = formatPullRequests(noLabelPulls);
      const changelogPath = './CHANGELOG.md';
      const currentVersionAsNumber = Number(currentVersion?.replaceAll('.', ''));
      const nextVersionAsNumber = Number(version?.replaceAll('.', ''));
      const isNumber = (value) => {
        return typeof value === 'number' && Number.isFinite(value);
      };

      // Add compare link to the end of the file
      let lastline = '';
      if (isNumber(currentVersionAsNumber) && isNumber(nextVersionAsNumber)) {
        lastline = `\n[v${version}]: https://github.com/luigi-project/luigi/compare/${lastCoreModularRelease.tag_name}...core-modular/v${version}`;
      }

      // Read file before append last line to file, otherwise it will not be written
      fs.readFileSync(changelogPath, 'utf8');
      safeAppendFile(changelogPath, lastline);

      // Add the new release entry to the changelog after the comment (in the changelog)
      const newChangelog = `\n\n## [v${version}] (${getCurrentDate()})\n\n${
        coreModularBreakingChanges ? `#### ":boom: Breaking Change"\n${coreModularBreakingChanges}\n\n` : ''
      }${coreModularEnhancementChanges ? `#### :rocket: Added\n\n${coreModularEnhancementChanges}\n\n` : ''}${
        coreModularBugChanges ? `#### :bug: Fixed\n\n${coreModularBugChanges}\n\n` : ''
      }${coreModularNoLabelChanges ? `#### :internal: Issue with no label\n\n${coreModularNoLabelChanges}\n` : ''}`;

      fs.readFile(changelogPath, 'utf8', (err, data) => {
        if (err) {
          logError('Cannot read file when trying to add release to changelog file:', err);
          return;
        }

        const searchText = '<!-- Generate the changelog using release cli. -->';

        // Find searchText and add after the searchText the new release to the changelog
        if (data.includes(searchText)) {
          const newData = data.replace(searchText, `${searchText}\n\n${newChangelog}`);
          fs.writeFile(changelogPath, newData, 'utf8', (err) => {
            if (err) {
              console.error('Cannot write data to file:', err);
              return;
            }
          });
        } else {
          console.log('The searchText (comment) was not found in CHANGELOG file.');
          return;
        }
      });

      logSuccess('Changelog updated successfully!');

      console.log(
        color.bold(`\nThen continue with the following steps:
              1. Run: npm run replace-version-in-docu
              2. Check and modify CHANGELOG.md entries
              3. Add and commit changed files
              4. Follow the rest of our internal release documentation
              `)
      );
    } catch (error) {
      logError('Error generating changelog:', error);
    }
    rl.close();
  });
}

prepareRelease();
