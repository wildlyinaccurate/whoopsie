const format = require('util').format
const Log = require('log')
const log = new Log('error')

log.log = function (level, args) {
  if (Log[level] <= this.level) {
    this.stream.write(`${format.apply(null, args)}\n`)
  }
}

module.exports = log
