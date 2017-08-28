const { filter, identity, map, orderBy, template } = require('lodash/fp')
const Promise = require('bluebird')
const fs = require('fs-extra')
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const log = require('./log')
const identifier = require('./identifier')

module.exports = function gallery (baseDir, results, failureThreshold) {
  const validResults = filter(identity, results)
  const galleryId = identifier('gallery')
  const galleryDir = path.join(baseDir, galleryId)
  const galleryIndexPath = path.join(galleryDir, 'index.html')

  log.info(`Generating gallery for ${validResults.length} results`)
  log.time(galleryId)

  return mkdirp(galleryDir)
    .then(() => fs.readFile(templatePath(), 'utf8'))
    .then(view => [template(view), processResults(galleryDir, validResults, failureThreshold)])
    .all()
    .then(([compiledTmpl, processedResults]) => compiledTmpl({
      results: processedResults,
      summary: makeSummary(processedResults),
      failureThreshold,
      time: new Date()
    }))
    .then(html => fs.writeFile(galleryIndexPath, html))
    .then(() => {
      log.info(`Gallery written to ${galleryIndexPath}`)
      log.timeEnd(galleryId)
    })
}

function templatePath () {
  return path.join(__dirname, 'template/gallery.html')
}

function makeSummary (results) {
  const total = results.length
  const failures = filter('failed', results).length
  const passes = total - failures

  return { total, failures, passes }
}

function processResults (galleryDir, results, failureThreshold) {
  return Promise.resolve(results.sort(byDifference))
    .then(map(result => copyImages(galleryDir, result), results))
    .all()
    .then(map(result => setFailed(failureThreshold, result)))
    .then(orderBy('results.percentage', 'desc'))
}

function byDifference (result1, result2) {
  return result2.diff.percentage - result1.diff.percentage
}

function copyImages (galleryDir, result) {
  const baseImagePath = `${result.base.id}.png`
  const testImagePath = `${result.test.id}.png`
  const diffImagePath = `${result.diff.id}.png`

  return Promise.all([
    fs.copy(result.base.imagePath, path.join(galleryDir, baseImagePath)),
    fs.copy(result.test.imagePath, path.join(galleryDir, testImagePath)),
    fs.copy(result.diff.imagePath, path.join(galleryDir, diffImagePath))
  ]).then(() => {
    result.base.imagePath = baseImagePath
    result.test.imagePath = testImagePath
    result.diff.imagePath = diffImagePath

    return result
  })
}

function setFailed (failureThreshold, result) {
  result.failed = result.diff.percentage >= (failureThreshold / 100)

  return result
}
