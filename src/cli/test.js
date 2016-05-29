const _ = require('lodash/fp')
const Promise = require('bluebird')
const product = require('cartesian-product')
// const queue = require('queue')
const capture = require('../capture')
const compare = require('../compare')
const gallery = require('../gallery')

const makeGallery = config => diffs => gallery(config.gallery_dir, diffs, config.failure_threshold)

module.exports = function test (config) {
  return Promise.all(makeCaptures(config))
    .then(_.chunk(2))
    .then(_.map(diffPairs))
    .all()
    .then(makeGallery(config))
}

const flatten = xs => [].concat.apply([], xs)

function makeCaptures (config) {
  const tests = product([
    config.urls,
    config.widths
  ])

  const capturePairs = tests.map(([url, width]) => [
    capture(config.sites[0] + url, width, config),
    capture(config.sites[1] + url, width, config)
  ])

  return flatten(capturePairs)
}

function diffPairs ([base, test]) {
  return compare(base, test)
}
