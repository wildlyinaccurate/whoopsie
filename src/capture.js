const { merge, unset } = require('lodash/fp')
const Promise = require('bluebird')
const path = require('path')
const childProcess = require('child_process')
const phantomjs = require('phantomjs-prebuilt')
const log = require('./log')
const identifier = require('./identifier')

const CLIENT_LOG_MARKER = '#LOG#'
const DEFAULT_OPTIONS = {
  ignoreSelectors: [],
  renderWaitTime: 1000,
  logMarker: CLIENT_LOG_MARKER
}

module.exports = function capture (url, width, userOpts = {}) {
  const captureId = identifier('capture')
  const options = merge(
    merge(DEFAULT_OPTIONS, userOpts),
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
      const chunkString = chunk.toString('ascii')
      const logMessage = extractLogMessage(chunkString)

      if (logMessage) {
        logDriverMessage(logMessage)
      } else {
        imageData.push(Buffer.from(chunkString, 'base64'))
      }
    })

    proc.on('close', () => {
      log.timeEnd(captureId)
      resolve(new CaptureResult(url, width, Buffer.concat(imageData)))
    })
  })
}

function logDriverMessage (message) {
  log.log(message.level, [
    '[DRIVER]',
    JSON.stringify(unset('level', message))
  ])
}

function extractLogMessage (string) {
  const markerLength = CLIENT_LOG_MARKER.length

  if (string.substr(0, markerLength) === CLIENT_LOG_MARKER) {
    return JSON.parse(string.substr(markerLength))
  }
}

function CaptureResult (url, width, image) {
  this.url = url
  this.width = width
  this.image = image
}
