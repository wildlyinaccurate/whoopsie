const _ = require('lodash/fp')
const path = require('path')
const childProcess = require('child_process')
const phantomjs = require('phantomjs-prebuilt')
const log = require('./log')
const identifier = require('./identifier')

const DEFAULT_OPTIONS = {
  ignoreSelectors: [],
  renderWaitTime: 1000
}

module.exports = function capture (url, width, userOpts = {}) {
  const captureId = identifier('capture')
  const options = _.merge(
    _.merge(DEFAULT_OPTIONS, userOpts),
    { url, width }
  )

  return new Promise(resolve => {
    log.info(`Capturing ${url} at ${width}px`)
    log.debug(`Capture identifier is ${captureId}`)
    log.time(captureId)

    const args = [
      path.join(__dirname, 'driver/phantomjs.js'),
      JSON.stringify(options)
    ]

    const proc = childProcess.spawn(phantomjs.path, args)
    const imageData = []

    proc.stdout.on('data', chunk => {
      imageData.push(Buffer.from(chunk.toString('ascii'), 'base64'))
    })

    proc.on('close', () => {
      log.timeEnd(captureId)
      resolve(new CaptureResult(url, width, Buffer.concat(imageData)))
    })
  })
}

function CaptureResult (url, width, image) {
  this.url = url
  this.width = width
  this.image = image
}
