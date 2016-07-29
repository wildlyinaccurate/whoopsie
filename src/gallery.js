const _ = require('lodash/fp')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const log = require('./log')
const identifier = require('./identifier')

module.exports = function gallery (baseDir, diffs, failureThreshold) {
  const galleryId = identifier('gallery')
  const galleryDir = path.join(baseDir, galleryId)
  const galleryIndexPath = path.join(galleryDir, 'index.html')

  log.info(`Generating gallery for ${diffs.length} results`)
  log.time(galleryId)

  return mkdirp(galleryDir)
    .then(() => fs.readFileAsync(templatePath(), 'utf8'))
    .then(_.template)
    .then(template => [template, processDiffs(diffs, failureThreshold)])
    .all()
    .then(([template, results]) => template({
      results,
      summary: makeSummary(results),
      failureThreshold,
      time: new Date()
    }))
    .then(html => fs.writeFileAsync(galleryIndexPath, html))
    .then(() => {
      log.info(`Gallery written to ${galleryIndexPath}`)
      log.timeEnd(galleryId)
    })
}

function templatePath () {
  return path.join(__dirname, 'template/gallery.html')
}

function makeSummary (diffs) {
  const total = diffs.length
  const failures = _.filter('failed', diffs).length
  const passes = total - failures

  return { total, failures, passes }
}

function processDiffs (diffs, failureThreshold) {
  return Promise.resolve(diffs)
    .then(_.map(setFailed.bind(this, failureThreshold)))
    .then(_.orderBy('results.percentage', 'desc'))
}

function setFailed (failureThreshold, diff) {
  diff.failed = diff.results.percentage >= (failureThreshold / 100)

  return diff
}
