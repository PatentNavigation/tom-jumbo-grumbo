#!/usr/bin/env node

const getChangelog = require('../lib/get-changelog');

let args = require('minimist')(process.argv.slice(2));
let [ fromRef, toRef ] = args._;

function printHelp() {
  console.log("Usage: changelog <from-ref> <to-ref>");
  console.log("  from-ref and to-ref are git refs to compare, e.g. 'v1.0.5' and 'master'");
}

if (!fromRef || !toRef) {
  printHelp();
  process.exit(1);
}

if (args.h || args.help) {
  printHelp();
  process.exit(0);
}

getChangelog(fromRef, toRef);
