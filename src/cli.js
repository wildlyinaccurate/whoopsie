const pkg = require('../package.json')
const Log = require('log')
const log = require('./log')

const gallery = require('./cli/gallery')
const test = require('./cli/test')
const config = require('./config')
const identifier = require('./identifier')

module.exports = function cli (argv) {
  const command = argv._[0]
  const commandIdentifier = identifier(`command$${command}`)

  log.level = Log.INFO

  if (argv.debug) {
    log.level = Log.DEBUG
  } else if (argv.quiet) {
    log.level = Log.ERROR
  }

  log.time(commandIdentifier)

  switch (command) {
    case 'gallery':
      config.validateFile(argv._[1])
        .then(config => gallery(config, argv))
        .then(() => log.timeEnd(commandIdentifier))
        .catch(err => console.error(`Error: ${err.message}`))

      break

    case 'test':
      config.validateFile(argv._[1])
        .then(config => test(config, argv))
        .then(results => JSON.stringify(results, null, 4))
        .then(console.log)
        .then(() => log.timeEnd(commandIdentifier))
        .catch(err => console.error(`Error: ${err.message}`))

      break

    case 'validate-config':
      config.validateFile(argv._[1])
        .then(() => console.log('Configuration is valid.'))
        .then(() => log.timeEnd(commandIdentifier))
        .catch(err => console.error(err.message))

      break

    case 'version':
      console.log(pkg.version)
      break

    case 'help':
    default:
      usage()
  }
}

function usage () {
  console.log(`
Whoopsie v${pkg.version}

Usage:

  whoopsie gallery <path>           Run visual regression tests and generate an HTML comparison gallery using the configuration at <path>
  whoopsie test <path>              Run visual regression tests and output raw JSON results using the configuration at <path>
  whoopsie validate-config <path>   Validate configuration at <path>
  whoopsie version                  Show the program version
  whoopsie help                     Show this message

Extra flags:

  --concurrency                     Number of tests to run concurrently (default: one per CPU core)
  --debug                           Print extra debugging information while running (default: off)
  --quiet                           Only print errors while running (default: off)

  `)
}
