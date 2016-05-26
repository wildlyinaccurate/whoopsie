const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const yaml = require('js-yaml')

const test = require('./cli/test')
const argv = require('minimist')(process.argv.slice(2))
const command = argv._[0]

switch (command) {
  case 'test':
    const configPath = argv._[1]

    readFile(configPath, 'utf8')
      .then(yaml.safeLoad)
      .then(test)

    break;

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
