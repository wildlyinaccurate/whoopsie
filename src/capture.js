const path = require('path')
const os = require('os')
const log = require('./log')
const identifier = require('./identifier')

module.exports = async function capture (driver, url, viewport, config) {
  const { width } = viewport
  const captureId = identifier('capture')

  log.info(`Capturing ${url} at ${width}px`)
  log.debug(`Capture identifier is ${captureId}`)
  log.time(captureId)

  const imagePath = path.join(os.tmpdir(), `whoopsie-${captureId}.png`)

  await driver.capture(imagePath, url, viewport, config)

  log.timeEnd(captureId)

  return new CaptureResult(captureId, url, viewport, imagePath)
}

function CaptureResult (id, url, viewport, imagePath) {
  this.id = id
  this.url = url
  this.viewport = viewport
  this.imagePath = imagePath
}
