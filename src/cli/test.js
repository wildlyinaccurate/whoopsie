const Promise = require('bluebird')
const { chunk, getOr, pick } = require('lodash/fp')
const os = require('os')
const Queue = require('queue')
const product = require('cartesian-product')
const capture = require('../capture')
const compare = require('../compare')

module.exports = function test (config, argv) {
  const concurrency = getOr(os.cpus().length, 'concurrency', argv)
  const q = new Queue({ concurrency })

  const captureOpts = pick(['ignoreSelectors', 'renderWaitTime'], config)
  const testPairs = chunk(2, testPermutations(config))
  const diffPs = []

  testPairs.forEach(pair => {
    q.push(cb => {
      capturePair(pair, captureOpts)
        .then(captures => cb(null, captures))
    })
  })

  q.on('success', captures => diffPs.push(diffCaptures(captures)))

  return new Promise(resolve =>
    q.start(() =>
      Promise.all(diffPs).then(diffs => resolve(diffs))
    )
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
