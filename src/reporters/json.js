const fs = require("fs-extra");
const log = require("../log");

module.exports = async function jsonReporter(output, config) {
  return fs.outputJSON(config.inFile, output).then(() => log.notice(`Wrote results to ${config.inFile}`));
};
