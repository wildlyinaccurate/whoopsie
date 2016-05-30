const Log = require('log')
const log = require('./log')

const test = require('./cli/test')
const config = require('./config')

const argv = require('minimist')(process.argv.slice(2))
const command = argv._[0]

if (argv.verbose) {
  log.level = Log.DEBUG
}

switch (command) {
  case 'test':
    config.validateFile(argv._[1])
      .then(config => test(config, argv))
      .catch(err => console.error(`Error: ${err.message}`))

    break

  case 'validate-config':
    config.validateFile(argv._[1])
      .then(() => console.log('Configuration is valid.'))
      .catch(err => console.error(err.message))

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

  whoopsie test <path>              Run visual regression tests using configuration at <path>
  whoopsie validate-config <path>   Validate configuration at <path>
  `)
}
