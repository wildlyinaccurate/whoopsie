const _ = require('lodash-fp')
const Promise = require('bluebird')
const product = require('cartesian-product')
const whoopsie = require('../')

module.exports = function test (config) {
  const makeCapturePair = ([url, width]) => [
    whoopsie.capture(config.sites[0] + url, width),
    whoopsie.capture(config.sites[1] + url, width)
  ]

  const tests = product([
    config.urls,
    config.widths
  ])

  const capturePairs = tests.map(makeCapturePair)
  const flattenedCaptures = [].concat.apply([], capturePairs)

  Promise.all(flattenedCaptures)
    .then(_.chunk(2))
    .then(results => results.map(diffPairs))
    .all()
    .then(results => results.forEach(analyseDiff))
}

function diffPairs ([base, test]) {
  return whoopsie.compare(base, test)
}

function analyseDiff (diff) {
  console.log(`${diff.results.percentage.toFixed(2)}% difference between ${diff.base.url} and ${diff.test.url} at ${diff.base.width}px`)
}
