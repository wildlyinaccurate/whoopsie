module.exports = function jsonReporter (output, config) {
  console.log(JSON.stringify(output, null, 4))
}
