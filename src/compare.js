const Promise = require('bluebird')
const path = require('path')
const diff = Promise.promisify(require('image-diff').getFullResult)
const log = require('./log')
const identifier = require('./identifier')

module.exports = function compare (baseCapture, testCapture) {
  const compareId = identifier('compare')

  log.info(`Comparing captures of ${baseCapture.url} and ${testCapture.url}`)
  log.debug(`Compare identifier is ${compareId}`)
  log.time(compareId)

  const diffImagePath = path.join(
    path.dirname(baseCapture.imagePath),
    `whoopsie-${compareId}.png`
  )

  return diff({
    expectedImage: baseCapture.imagePath,
    actualImage: testCapture.imagePath,
    diffImage: diffImagePath
  })
    .then(results => {
      log.timeEnd(compareId)

      results.id = compareId
      results.imagePath = diffImagePath

      return new Diff(results, baseCapture, testCapture)
    })
    .catch(error => {
      log.error(
        'Unable to compare screenshots. The driver was probably unable to load one of the pages.'
      )
      log.debug(`${compareId} diff generation failed: ${error}`)
    })
}

function Diff (diff, baseCapture, testCapture) {
  this.base = baseCapture
  this.test = testCapture
  this.diff = diff
}
