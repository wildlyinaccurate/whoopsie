const _ = require('lodash')
const path = require('path')
const childProcess = require('child_process')
const phantomjs = require('phantomjs')
const log = require('./log')

const DEFAULT_OPTIONS = {
  ignoreSelectors: [],
  renderWaitTime: 1000
}

module.exports = function capture (url, width, userOpts = {}) {
  const options = _.merge(DEFAULT_OPTIONS, userOpts)

  return new Promise(resolve => {
    log.info(`Capturing ${url} at ${width}px`)

    const args = [
      path.join(__dirname, 'driver/phantomjs.js'),
      url,
      width,
      JSON.stringify(options)
    ]

    const proc = childProcess.spawn(phantomjs.path, args)
    const imageData = []

    proc.stdout.on('data', chunk => {
      imageData.push(Buffer.from(chunk.toString('ascii'), 'base64'))
    })

    proc.on('close', () => {
      resolve(new CaptureResult(url, width, Buffer.concat(imageData)))
    })
  })
}

function CaptureResult (url, width, image) {
  this.url = url
  this.width = width
  this.image = image
}
