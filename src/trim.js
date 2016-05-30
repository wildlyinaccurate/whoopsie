const childProcess = require('child_process')

module.exports = function trim (image) {
  const cmd = 'convert'
  const args = [
    '-',
    '-trim',
    '-'
  ]

  const proc = childProcess.spawn(cmd, args)
  const data = []

  proc.stdout.on('data', chunk => data.push(chunk))

  proc.stdin.write(image)
  proc.stdin.end()

  return new Promise((resolve, reject) => {
    proc.on('close', () => resolve(Buffer.concat(data)))

    proc.stderr.on('data', err => reject(err.toString()))
  })
}
