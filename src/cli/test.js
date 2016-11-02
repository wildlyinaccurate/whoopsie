const Promise = require('bluebird')
const { getOr, pick } = require('lodash/fp')
const os = require('os')
const Queue = require('queue')
const testPermutations = require('../test-permutations')
const capture = require('../capture')
const compare = require('../compare')

module.exports = function test (config, argv) {
  const concurrency = getOr(os.cpus().length, 'concurrency', argv)
  const q = new Queue({ concurrency })

  const captureOpts = pick(['ignoreSelectors', 'renderWaitTime'], config)
  const testPairs = testPermutations(config.sites.slice(0, 2), config.urls, config.widths)
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

function capturePair (pair, opts) {
  const makeCapture = ([url, width]) => capture(url, width, opts)

  return Promise.all(pair.map(makeCapture))
}

function diffCaptures ([base, test]) {
  return compare(base, test)
}
