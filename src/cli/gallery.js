const test = require('./test')
const gallery = require('../gallery')

module.exports = function generateGallery (config, argv) {
  return test(config, argv).then(diffs =>
    gallery(config.galleryDir, diffs, config.failureThreshold)
  )
}
