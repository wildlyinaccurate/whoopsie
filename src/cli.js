const Promise = require('bluebird')
const pkg = require('../package.json')
const log = require('./log')

const test = require('./test')
const { processFile } = require('./config')
const identifier = require('./identifier')
const reporters = require('./reporters')

const DEFAULT_REPORTERS = ['json']

module.exports = function cli (argv) {
  if (argv.verbose) {
    log.level = log.INFO
  } else if (argv.debug) {
    log.level = log.DEBUG
  } else if (argv.quiet) {
    log.level = log.ERROR
  }

  const command = argv._[0]
  const commandIdentifier = identifier(`command$${command}`)

  log.debug(`Command identifier is ${commandIdentifier}`)

  log.time(commandIdentifier)

  runCommand(command, argv)
    .then(() => log.timeEnd(commandIdentifier))
    .catch(error => {
      log.error(error.message)
      log.debug(error)
      process.exit(1)
    })
}

function runCommand (command, argv) {
  switch (command) {
    case 'gallery':
    case 'test':
      const reporters =
        command === 'gallery' ? ['gallery'] : getReporters(argv.reporter)

      return processFile(argv._[1])
        .then(config => [config, test(config, argv)])
        .all()
        .spread((config, output) => reportOutput(output, config, reporters))

    case 'validate-config':
      return processFile(argv._[1]).then(() =>
        console.log('Configuration is valid.')
      )

    case 'version':
      return Promise.resolve(console.log(pkg.version))

    case 'help':
    default:
      return Promise.resolve(usage())
  }
}

function getReporters (reporterNames = DEFAULT_REPORTERS) {
  return [].concat(reporterNames)
}

function reportOutput (output, config, useReporters) {
  useReporters.forEach(reporterName => {
    const reporter = reporters[reporterName]

    if (reporter) {
      reporter(output, config)
    } else {
      log.warning(`Reporter "${reporterName}" does not exist`)
    }
  })
}

function usage () {
  console.log(`
Whoopsie v${pkg.version}

Usage:

  whoopsie test <configPath>              Run visual regression tests and output raw JSON results using the configuration at <configPath>
  whoopsie gallery <configPath>           Run visual regression tests and generate an HTML comparison gallery using the configuration at <configPath>
  whoopsie validate-config <configPath>   Validate configuration at <configPath>
  whoopsie generate-gallery <configPath>  Generate a gallery from JSON using the configuration at <configPath>
  whoopsie version                        Show the program version
  whoopsie help                           Show this message

Extra flags:

  --concurrency      Number of tests to run concurrently (default: one per CPU core)
  --verbose          Print test information while running (default: off)
  --debug            Print extra debugging information while running (default: off)
  --quiet            Only print errors and reporter output while running (default: off)

  `)
}
