const format = require("util").format;
const console = require("console");
const Logger = require("log");

const log = new Logger();
log.level = Logger.NOTICE;

log.log = function (level, args) {
  if (Logger[level] <= this.level) {
    this.stream.write(`${format.apply(null, args)}\n`);
  }
};

log.error = function (message) {
  this.log("ERROR", [`ERROR: ${message}`]);
};

log.time = function (label) {
  if (this.level >= Logger.DEBUG) {
    console.time(label);
  }
};

log.timeEnd = function (label) {
  if (this.level >= Logger.DEBUG) {
    console.timeEnd(label);
  }
};

log.EMERGENCY = Logger.EMERGENCY;
log.ALERT = Logger.ALERT;
log.CRITICAL = Logger.CRITICAL;
log.ERROR = Logger.ERROR;
log.WARNING = Logger.WARNING;
log.NOTICE = Logger.NOTICE;
log.INFO = Logger.INFO;
log.DEBUG = Logger.DEBUG;

module.exports = log;
