const Promise = require('bluebird')
const childProcess = require('child_process')

module.exports = function trim (path) {
  const cmd = 'convert'
  const args = [
    path,
    '-trim',
    path
  ]

  const proc = childProcess.spawn(cmd, args)

  return new Promise((resolve, reject) => {
    proc.on('close', () => resolve(path))
    proc.stderr.on('data', err => reject(err.toString()))
  })
}
