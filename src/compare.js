const Promise = require('bluebird')
const fs = require('fs')
const writeFile = Promise.promisify(fs.writeFile)
const readFile = Promise.promisify(fs.readFile)
const diff = Promise.promisify(require('image-diff').getFullResult)

module.exports = function compare (capture1, capture2) {
  return new Promise(resolve => {
    fs.mkdtemp('/tmp/whoopsie-', (err, dir) => {
      const createImageFiles = [
        writeFile(`${dir}/base`, capture1.image, 'binary'),
        writeFile(`${dir}/new`, capture2.image, 'binary')
      ]

      const compareImages = () => diff({
        expectedImage: `${dir}/base`,
        actualImage: `${dir}/new`,
        diffImage: `${dir}/diff`,
        shadow: true
      })

      Promise.all(createImageFiles)
        .then(compareImages)
        .then(results => [results, readFile(`${dir}/diff`)])
        .all()
        .then(([results, image]) => {
          resolve(new Diff(results.total, results.percentage, image))
        })
    })
  })
}

function Diff (pixels, percentage, image) {
  this.pixels = pixels
  this.percentage = percentage
  this.image = image
}
