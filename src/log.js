const format = require('util').format
const console = require('console')
const Log = require('log')
const log = new Log('error')

log.log = function (level, args) {
  if (Log[level] <= this.level) {
    this.stream.write(`${format.apply(null, args)}\n`)
  }
}

log.error = function (message) {
  log.log('ERROR', [`ERROR: ${message}`])
}

log.time = function (label) {
  if (this.level >= Log.DEBUG) {
    console.time(label)
  }
}

log.timeEnd = function (label) {
  if (this.level >= Log.DEBUG) {
    console.timeEnd(label)
  }
}

module.exports = log
