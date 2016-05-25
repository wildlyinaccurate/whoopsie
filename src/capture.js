const path = require('path')
const childProcess = require('child_process')
const phantomjs = require('phantomjs')

module.exports = function capture (url, width) {
  const args = [
    path.join(__dirname, 'driver/phantomjs.js'),
    url,
    width
  ]

  return new Promise(resolve => {
    const proc = childProcess.spawn(phantomjs.path, args)
    let data = []

    proc.stdout.on('data', chunk => {
      data.push(Buffer.from(chunk, 'base64'))
    })

    proc.on('close', () => {
      resolve(new CaptureResult(url, width, Buffer.concat(data)))
    })
  })
}

function CaptureResult (url, width, image) {
  this.url = url
  this.width = width
  this.image = image
}
