const _ = require('lodash')
const Promise = require('bluebird')
const rimraf = require('rimraf')
const fs = Promise.promisifyAll(require('fs'))
const diff = Promise.promisify(require('image-diff').getFullResult)
const log = require('./log')
const trim = require('./trim')
const identifier = require('./identifier')

const TMP_DIR = '/tmp/whoopsie-compare-'

module.exports = function compare (capture1, capture2) {
  return new Promise((resolve, reject) => {
    const compareId = identifier('compare')

    log.info(`Comparing captures of ${capture1.url} and ${capture2.url} at ${capture1.width}px`)
    log.debug(`Compare identifier is ${compareId}`)
    log.time(compareId)

    fs.mkdtemp(TMP_DIR, (err, dir) => {
      if (err) {
        reject(err)
      }

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

      Promise.all(trimImages)
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

          rimraf(dir, () => resolve(diff))
        })
    })
  })
}

function Diff (results, image, base, test) {
  this.results = results
  this.image = image
  this.base = base
  this.test = test
}
