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
      data.push(Buffer.from(chunk.toString('ascii'), 'base64'))
    })

    proc.on('close', () => {
      const dataLength = data.reduce((prev, curr) => prev + curr.length, 0)
      const result = new CaptureResult(url, width, Buffer.concat(data))

      resolve(result)
    })
  })
}

function CaptureResult (url, width, image) {
  this.url = url
  this.width = width
  this.image = image
}
