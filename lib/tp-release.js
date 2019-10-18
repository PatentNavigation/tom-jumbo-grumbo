const { execSync } = require('child_process');
const { readJsonSync } = require('fs-extra');
const { homedir } = require('os');
const path = require('path');
const request = require('request-promise');
const gitRelease = promisify(require('git-release'));
const yesno = require('yesno');
const getChangelog = require('../lib/get-changelog');
const colors = require('colors/safe');

module.exports = async function({ skipTag = false }) {
  if (!process.env.RELEASE_ANY_BRANCH) {
    let branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    if (branch !== 'master') {
      die('You must be on master to release');
    }
  }

  // in case pre-commit hook to prevent committing to master is in place
  process.env.ALLOW_MASTER = 1;

  try {
    // Get all this up front so if something goes wrong we bail before modifying
    // anything in the repo
    let repo = execSync('git remote get-url origin').toString().trim();
    // Extract <owner>/<repo> from git URL
    let match = /([^:/]+\/[^:/.]+)(\.git)?$/.exec(repo);
    if (!match) {
      throw new Error(`Unable to parse repo origin URL: ${repo}`);
    }
    let [ , path ] = match;
    let repoUrl = `https://github.com/${path}`;
    let { githubAccessToken } = getConfig();


    console.log('Generating release notes...');
    let releaseNotes = await buildReleaseNotes();

    if (releaseNotes) {
      if (!await ask(`Release notes:\n\n${releaseNotes}\n\nDo these look correct? [y]`, true)) {
        process.exit(1);
      }
    } else {
      if (!await ask('No PR merge commits found. Release with empty changelog? [n]')) {
        process.exit(1);
      }
    }

    let tagName = null;
    if (skipTag) {
      tagName = getLastVersionTag();
      if (!await ask(`Create release with this tag? ${tagName} [y]`, true)) {
        process.exit(1);
      }
    } else {
      console.log('Creating tag...');
      await gitRelease();
      tagName = getLastVersionTag();
      console.log(`Created tag ${tagName}`);
    }
    if (githubAccessToken) {
      console.log('Creating release...');
      let apiUrl = `https://api.github.com/repos/${path}/releases`;

      await request({
        method: 'POST',
        uri: apiUrl,
        qs: {
          'access_token': githubAccessToken
        },
        headers: {
          'User-Agent': 'tom-jumbo-grumbo (@bendemboski)'
        },
        body: {
          'tag_name': tagName,
          body: releaseNotes
        },
        json: true
      });

      console.log(`\nVersion released at tag ${tagName}!`);
      process.exit();
    } else {
      console.log(`\nVersion tagged at ${tagName}! Now paste changelog into ${repoUrl}/releases/edit/${tagName}:\n\n${releaseNotes}"`);
      const readmeUrl = 'https://github.com/PatentNavigation/tom-jumbo-grumbo/blob/master/README.md#github-api-access';
      console.log(`\n(this step can be done automatically in the future -- see ${readmeUrl} for details)`);
      process.exit();
    }
  } catch ({ message }) {
    die(message);
  }
};

//
// Get the name of the most recent version tag
//
function getLastVersionTag() {
  let tagLines = execSync('git tag -l --sort v:refname').toString().trim().split('\n');
  let tags = tagLines.filter((tag) => tag[0] === 'v');
  if (tags.length === 0) {
    return null;
  }
  return tags[tags.length - 1];
}

//
// Build the release notes
//
async function buildReleaseNotes() {
  function build(fromRef) {
    let changelog = getChangelog(fromRef, 'master');
    let changeLines = changelog.map(({ pr, description }) => `- ${pr} ${description}`);
    return changeLines.join('\n');
  }

  let lastTag = getLastVersionTag();
  if (lastTag) {
    return build(lastTag);
  } else {
    if (!await ask('No previous version found. Is this the first release? [n]')) {
      process.exit(1);
    }

    // Build with no arguments collects all changes
    return build();
  }
}

//
// Get the dot config out of ~/.tom-jumbo-grumbo
//
function getConfig() {
  try {
    return readJsonSync(path.join(homedir(), '.tom-jumbo-grumbo'));
  } catch (e) {
    return {};
  }
}

//
// Turn a node callback function into a promise-friendly function
//
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      if (fn.length > 1) {
        while (args.length < fn.length - 1) {
          args.push(undefined);
        }
      }

      fn(...args, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  };
}

//
// Promise-friendly ask wrapper -- it doesn't use the normal node callback
// format, so we can't use promisify().
//
function ask(message, defaultValue = false) {
  return new Promise((resolve, reject) => {
    yesno.ask(message, defaultValue, resolve);
  });
}

//
// Print error and exit
//
function die(message) {
  console.error(colors.red(`\n${message}\n`));
  process.exit(1);
}
