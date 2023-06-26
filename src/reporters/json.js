module.exports = function jsonReporter(output) {
  console.log(JSON.stringify(output, null, 4));
};
