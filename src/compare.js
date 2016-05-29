const Promise = require('bluebird')
const rimraf = require('rimraf')
const fs = Promise.promisifyAll(require('fs'))
const diff = Promise.promisify(require('image-diff').getFullResult)
const log = require('./log')

const TMP_DIR = '/tmp/whoopsie-compare-'

module.exports = function compare (capture1, capture2) {
  return new Promise((resolve, reject) => {
    log.info(`Comparing captures of ${capture1.url} and ${capture2.url} at ${capture1.width}px`)

    fs.mkdtemp(TMP_DIR, (err, dir) => {
      if (err) {
        reject(err)
      }

      const createImageFiles = [
        fs.writeFileAsync(`${dir}/base`, capture1.image, 'binary'),
        fs.writeFileAsync(`${dir}/new`, capture2.image, 'binary')
      ]

      const compareImages = () => diff({
        expectedImage: `${dir}/base`,
        actualImage: `${dir}/new`,
        diffImage: `${dir}/diff`,
        shadow: true
      })

      Promise.all(createImageFiles)
        .then(compareImages)
        .then(results => [results, fs.readFileAsync(`${dir}/diff`)])
        .all()
        .then(([results, image]) => {
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
