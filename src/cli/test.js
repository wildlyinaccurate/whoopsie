const _ = require('lodash-fp')
const Promise = require('bluebird')
const product = require('cartesian-product')
const capture = require('../capture')
const compare = require('../compare')

module.exports = function test (config) {
  return Promise.all(makeCaptures(config))
    .then(_.chunk(2))
    .then(results => results.map(diffPairs))
    .all()
    .then(results => results.forEach(analyseDiff))
}

const flatten = xs => [].concat.apply([], xs)

function makeCaptures (config) {
  const tests = product([
    config.urls,
    config.widths
  ])

  const capturePairs = tests.map(([url, width]) => [
    capture(config.sites[0] + url, width),
    capture(config.sites[1] + url, width)
  ])

  return flatten(capturePairs)
}

function diffPairs ([base, test]) {
  return compare(base, test)
}

function analyseDiff (diff) {
  console.log(`${diff.results.percentage.toFixed(2)}% difference between ${diff.base.url} and ${diff.test.url} at ${diff.base.width}px`)
}
