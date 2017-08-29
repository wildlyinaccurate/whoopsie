const Promise = require('bluebird')
const { filter, getOr, set } = require('lodash/fp')
const os = require('os')
const Queue = require('queue')
const testPermutations = require('./test-permutations')
const capture = require('./capture')
const compare = require('./compare')
const drivers = require('./drivers')

module.exports = async function test (config, argv) {
  const driver = drivers[config.browser]

  if (!driver) {
    throw new Error(`Unsupported browser "${config.browser}"`)
  }

  const results = []
  const testPairs = testPermutations(
    config.sites.slice(0, 2),
    config.urls,
    config.viewports
  )
  const concurrency = getOr(os.cpus().length, 'concurrency', argv)
  const q = new Queue({ concurrency })

  q.on('success', result => results.push(result))

  await driver.initialise(config)

  testPairs.forEach(pair => {
    // Viewport is the same for both tuples
    const viewport = pair[0][1]

    q.push(cb => {
      capturePair(driver, pair, config)
        .then(diffCaptures)
        .then(set('viewport', viewport))
        .then(result => cb(null, result))
    })
  })

  return new Promise(resolve => {
    q.start(() => {
      driver.cleanUp()

      resolve(new TestResult(results))
    })
  })
}

function capturePair (driver, pair, config) {
  const makeCapture = ([url, viewport]) =>
    capture(driver, url, viewport, config)

  return Promise.all(pair.map(makeCapture))
}

function diffCaptures ([base, test]) {
  return compare(base, test)
}

function TestResult (results) {
  this.summary = makeSummary(results)
  this.results = results
}

function makeSummary (results) {
  const total = results.length
  const failures = filter('failed', results).length
  const passes = total - failures

  return { total, failures, passes }
}
