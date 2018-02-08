#!/usr/bin/env node

const { execSync } = require('child_process');
const gitRelease = require('git-release');
const getChangelog = require('../lib/get-changelog');

if (!process.ENV.RELEASE_ANY_BRANCH) {
  let branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (branch !== 'master') {
    console.error('You must be on master to release');
    process.exit(1);
  }
}

// in case pre-commit hook to prevent committing to master is in place
process.env.ALLOW_MASTER = 1;

gitRelease(undefined, undefined, undefined, function(err) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  } else {
    let tagLines = execSync('git tag -l --sort v:refname').toString().trim().split('\n');
    let tags = tagLines.filter((tag) => tag[0] === 'v');
    let prevVersion = tags[tags.length - 2];
    let newVersion = tags[tags.length - 1];

    let changelog;
    try {
      changelog = getChangelog(prevVersion, newVersion);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }

    let tagMessage = changelog.map(({ pr, description }) => `- ${pr} ${description}`).join('\n');
    execSync(`git tag ${newVersion} ${newVersion} -f -m "${tagMessage}"`);

    let repo = execSync('git remote get-url origin').toString();

    console.log(`\nVersion tagged! Changelog generated in ${repo}/releases/tag/${newVersion}:\n`);
    console.log(tagMessage);
  }
});
