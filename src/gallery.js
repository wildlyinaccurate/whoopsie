const _ = require('lodash/fp')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const crypto = require('crypto')
const log = require('./log')

module.exports = function gallery (baseDir, diffs, failureThreshold) {
  const galleryDir = path.join(baseDir, galleryName())
  const galleryIndexPath = path.join(galleryDir, 'index.html')

  log.info(`Generating gallery for ${diffs.length} results`)

  return mkdirp(galleryDir)
    .then(() => fs.readFileAsync(templatePath(), 'utf8'))
    .then(_.template)
    .then(template => [template, processDiffs(galleryDir, diffs, failureThreshold)])
    .all()
    .then(([template, results]) => template({
      results,
      summary: makeSummary(results),
      failureThreshold,
      time: new Date()
    }))
    .then(html => fs.writeFileAsync(galleryIndexPath, html))
    .then(log.info(`Gallery written to ${galleryIndexPath}`))
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

function processDiffs (galleryDir, diffs, failureThreshold) {
  return Promise.all(diffs.map(saveImages.bind(this, galleryDir)))
    .then(_.map(setFailed.bind(this, failureThreshold)))
    .then(_.orderBy('results.percentage', 'desc'))
}

function setFailed (failureThreshold, diff) {
  diff.failed = diff.results.percentage >= (failureThreshold / 100)

  return diff
}

function saveImages (baseDir, diff, index) {
  diff.base.image.path = `base-${index}.png`
  diff.test.image.path = `test-${index}.png`
  diff.image.path = `diff-${index}.png`

  return Promise.all([
    fs.writeFileAsync(path.join(baseDir, diff.base.image.path), diff.base.image),
    fs.writeFileAsync(path.join(baseDir, diff.test.image.path), diff.test.image),
    fs.writeFileAsync(path.join(baseDir, diff.image.path), diff.image)
  ]).then(() => diff)
}

function galleryName () {
  return crypto.createHash('sha1')
    .update(new Date().toJSON())
    .digest('hex')
    .substr(0, 12)
}
