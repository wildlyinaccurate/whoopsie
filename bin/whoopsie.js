#!/usr/bin/env node

const cli = require('../src/cli')
const argv = require('minimist')(process.argv.slice(2))

cli(argv)
