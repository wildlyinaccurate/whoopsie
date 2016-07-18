const _ = require('lodash')
const Promise = require('bluebird')
const rimraf = Promise.promisify(require('rimraf'))
const fs = Promise.promisifyAll(require('fs'))
const diff = Promise.promisify(require('image-diff').getFullResult)
const log = require('./log')
const trim = require('./trim')
const identifier = require('./identifier')
const tmpdir = require('./tmpdir')

module.exports = function compare (capture1, capture2) {
  const compareId = identifier('compare')

  log.info(`Comparing captures of ${capture1.url} and ${capture2.url} at ${capture1.width}px`)
  log.debug(`Compare identifier is ${compareId}`)
  log.time(compareId)

  return tmpdir().then(dir => {
    const baseFile = `${dir}/base`
    const testFile = `${dir}/test`
    const diffFile = `${dir}/diff`

    const trimImages = [
      trim(capture1.image).then(data => _.set(capture1, 'image', data)),
      trim(capture2.image).then(data => _.set(capture2, 'image', data))
    ]

    const createImageFiles = () => [
      fs.writeFileAsync(baseFile, capture1.image, 'binary'),
      fs.writeFileAsync(testFile, capture2.image, 'binary')
    ]

    const compareImages = () => diff({
      expectedImage: baseFile,
      actualImage: testFile,
      diffImage: diffFile,
      shadow: true
    })

    return Promise.all(trimImages)
      .then(createImageFiles)
      .all()
      .then(compareImages)
      .then(results => [results, fs.readFileAsync(diffFile)])
      .all()
      .then(([results, image]) => {
        log.timeEnd(compareId)

        const diff = new Diff(
          results,
          image,
          capture1,
          capture2
        )

        return rimraf(dir).then(() => diff)
      })
  })
}

function Diff (results, image, base, test) {
  this.results = results
  this.image = image
  this.base = base
  this.test = test
}
