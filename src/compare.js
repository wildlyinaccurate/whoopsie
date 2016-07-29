const Promise = require('bluebird')
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
    const diffFile = `${dir}/diff`

    const trimImages = [
      trim(capture1.image),
      trim(capture2.image)
    ]

    const compareImages = () => diff({
      expectedImage: capture1.image,
      actualImage: capture2.image,
      diffImage: diffFile,
      shadow: true
    })

    return Promise.all(trimImages)
      .then(compareImages)
      .then(results => {
        log.timeEnd(compareId)

        return new Diff(
          results,
          diffFile,
          capture1,
          capture2
        )
      })
  })
}

function Diff (results, image, base, test) {
  this.results = results
  this.image = image
  this.base = base
  this.test = test
}
