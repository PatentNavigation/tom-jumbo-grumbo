'use strict';

const { execSync } = require('child_process');

function getChangelog(fromRef, toRef) {
  execSync("git fetch origin master --tags", {
    stdio: [ 'pipe', 'ignore', 'pipe' ]
  });

  let lines = readLines(`git log ${fromRef}...${toRef} --grep='Merge pull request' --pretty='%s %b'`);
  if (lines.length === 0) {
    throw new Error(`No changes since ${fromRef}`);
  }

  let r = new RegExp('^Merge pull request (#\\d+) from \\S+ (.+)$');
  let errors = [];
  let changelog = [];
  lines.forEach((line) => {
    let match = r.exec(line);
    if (match) {
      let [ , pr, description ] = match;
      changelog.push({ pr, description });
    } else {
      errors.push(`ERROR: Unable to parse commit: ${line}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return changelog;
}

function readLines(execCmd) {
  let output = execSync(execCmd).toString().trim();
  return output ? output.split('\n') : [];
}

module.exports = getChangelog;
