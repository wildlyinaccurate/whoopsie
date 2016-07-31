const { filter, identity, map, orderBy, template } = require('lodash/fp')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const log = require('./log')
const identifier = require('./identifier')

module.exports = function gallery (baseDir, diffs, failureThreshold) {
  const validDiffs = filter(identity, diffs)
  const galleryId = identifier('gallery')
  const galleryDir = path.join(baseDir, galleryId)
  const galleryIndexPath = path.join(galleryDir, 'index.html')

  log.info(`Generating gallery for ${validDiffs.length} results`)
  log.time(galleryId)

  return mkdirp(galleryDir)
    .then(() => fs.readFileAsync(templatePath(), 'utf8'))
    .then(view => [template(view), processDiffs(galleryDir, validDiffs, failureThreshold)])
    .all()
    .then(([compiledTmpl, results]) => compiledTmpl({
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
  const failures = filter('failed', diffs).length
  const passes = total - failures

  return { total, failures, passes }
}

function processDiffs (galleryDir, diffs, failureThreshold) {
  return Promise.all(diffs.map(saveImages.bind(this, galleryDir)))
    .then(map(setFailed.bind(this, failureThreshold)))
    .then(orderBy('results.percentage', 'desc'))
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
