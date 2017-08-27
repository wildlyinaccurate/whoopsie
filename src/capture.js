const log = require('./log')
const identifier = require('./identifier')

module.exports = async function capture (driver, url, viewport, config) {
  const { width } = viewport
  const captureId = identifier('capture')

  log.info(`Capturing ${url} at ${width}px`)
  log.debug(`Capture identifier is ${captureId}`)
  log.time(captureId)

  const image = await driver.capture(url, viewport, config)

  log.timeEnd(captureId)

  return new CaptureResult(url, viewport, image)
}

function CaptureResult (url, viewport, image) {
  this.url = url
  this.viewport = viewport
  this.image = image
}
