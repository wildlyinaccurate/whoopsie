const Promise = require('bluebird')
const { getOr } = require('lodash/fp')
const os = require('os')
const Queue = require('queue')
const testPermutations = require('../test-permutations')
const capture = require('../capture')
const compare = require('../compare')
const drivers = require('../drivers')

module.exports = async function test (config, argv) {
  const driver = drivers[config.browser]

  if (!driver) {
    throw new Error(`Unsupported browser "${config.browser}"`)
  }

  const diffs = []
  const testPairs = testPermutations(
    config.sites.slice(0, 2),
    config.urls,
    config.viewports
  )
  const concurrency = getOr(os.cpus().length, 'concurrency', argv)
  const q = new Queue({ concurrency })

  q.on('success', res => diffs.push(res))

  await driver.initialise(config)

  testPairs.forEach(pair => {
    q.push(cb => {
      capturePair(driver, pair, config)
        .then(diffCaptures)
        .then(diff => cb(null, diff))
    })
  })

  return new Promise(resolve => {
    q.start(() => {
      driver.cleanUp()

      resolve(diffs)
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
