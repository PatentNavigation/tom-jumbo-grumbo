'use strict';

const { execSync } = require('child_process');

function getChangelog(fromRef, toRef) {
  if (!toRef) {
    throw new Error('No toRef specified');
  }

  execSync("git pull --tags", {
    stdio: [ 'pipe', 'ignore', 'pipe' ]
  });

  let refs;
  if (fromRef) {
    refs = `${fromRef}...${toRef}`;
  } else {
    refs = toRef;
  }
  let lines = readLines(`git log ${refs} --grep='Merge pull request' --pretty='%s %b'`);

  let r = new RegExp('^Merge pull request (#\\d+) from (\\S+)(?: (.+))?$');
  let errors = [];
  let changelog = [];
  lines.forEach((line) => {
    let match = r.exec(line);
    if (match) {
      let [ , pr, branchName, description ] = match;
      changelog.push({
        pr,
        description: description || branchName
      });
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
