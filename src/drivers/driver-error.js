module.exports = function DriverError (message) {
  this.error = true
  this.message = message
}
