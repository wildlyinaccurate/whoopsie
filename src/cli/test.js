const _ = require('lodash/fp')
const os = require('os')
const Queue = require('queue')
const product = require('cartesian-product')
const capture = require('../capture')
const compare = require('../compare')

module.exports = function test (config, argv) {
  const concurrency = _.getOr(os.cpus().length, 'concurrency', argv)
  const q = new Queue({ concurrency })

  const captureOpts = _.pick(['ignoreSelectors', 'renderWaitTime'], config)
  const testPairs = _.chunk(2, testPermutations(config))
  const diffs = []

  testPairs.forEach(pair => {
    q.push(cb => {
      capturePair(pair, captureOpts)
        .then(diffCaptures)
        .then(diff => cb(null, diff))
    })
  })

  q.on('success', res => diffs.push(res))

  return new Promise(resolve =>
    q.start(() => resolve(diffs))
  )
}

function testPermutations (config) {
  return product([
    config.urls,
    config.widths,
    config.sites.slice(0, 2)
  ])
}

function capturePair (pair, opts) {
  const makeCapture = ([url, width, site]) => capture(site + url, width, opts)

  return Promise.all(pair.map(makeCapture))
}

function diffCaptures ([base, test]) {
  return compare(base, test)
}
