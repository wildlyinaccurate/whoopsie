const { map, orderBy, set, template } = require('lodash/fp')
const Promise = require('bluebird')
const fs = require('fs-extra')
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const log = require('../log')
const identifier = require('../identifier')

module.exports = function galleryReporter (output, config) {
  const galleryId = identifier('gallery')
  const galleryDir = path.join(config.galleryDir, galleryId)
  const galleryIndexPath = path.join(galleryDir, 'index.html')

  log.info(`Generating gallery for ${output.results.length} results`)
  log.time(galleryId)

  return mkdirp(galleryDir)
    .then(() => fs.readFile(templatePath(), 'utf8'))
    .then(view => [
      template(view),
      processOutput(galleryDir, output, config.failureThreshold)
    ])
    .all()
    .then(([compiledTmpl, processedOutput]) =>
      compiledTmpl(
        Object.assign(
          {
            failureThreshold: config.failureThreshold,
            time: new Date()
          },
          processedOutput
        )
      )
    )
    .then(html => fs.writeFile(galleryIndexPath, html))
    .then(() => {
      log.notice(`Gallery written to ${galleryIndexPath}`)
      log.timeEnd(galleryId)
    })
}

function templatePath () {
  return path.join(__dirname, '../../templates/gallery.html')
}

function processOutput (galleryDir, output, failureThreshold) {
  return Promise.resolve(output.results)
    .then(orderBy('diff.percentage', 'desc'))
    .then(map(result => setFailed(failureThreshold, result)))
    .then(map(result => copyImages(galleryDir, result)))
    .all()
    .then(results => set('results', results, output))
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
  return set('failed', result.diff.percentage >= failureThreshold / 100, result)
}
