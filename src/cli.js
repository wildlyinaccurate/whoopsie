const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const yaml = require('js-yaml')

const Log = require('log')
const log = require('./log')

const test = require('./cli/test')
const argv = require('minimist')(process.argv.slice(2))
const command = argv._[0]

if (argv.verbose) {
  log.level = Log.DEBUG
}

switch (command) {
  case 'test':
    const configPath = argv._[1]

    readFile(configPath, 'utf8')
      .then(yaml.safeLoad)
      .then(config => test(config, argv))

    break

  default:
    if (argv.version) {
      console.log(require('../package.json').version)
    } else {
      usage()
    }
}

function usage () {
  console.log(`
  Usage:

    whoopsie test <config>
  `)
}
