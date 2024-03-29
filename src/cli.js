const fs = require("fs-extra");
const pkg = require("../package.json");
const log = require("./log");
const test = require("./test");
const { processFile } = require("./config");
const identifier = require("./identifier");
const reporters = require("./reporters");
const { getOr } = require("lodash/fp");

const DEFAULT_REPORTERS = ["json"];

module.exports = function cli(argv) {
  if (argv.verbose || argv.v) {
    log.level = log.INFO;
  } else if (argv.debug || argv.vv) {
    log.level = log.DEBUG;
  } else if (argv.quiet || argv.q) {
    log.level = log.ERROR;
  }

  const command = argv._[0];
  const commandIdentifier = identifier(`command$${command}`);

  log.debug(`Command identifier is ${commandIdentifier}`);

  log.time(commandIdentifier);

  runCommand(command, argv)
    .then(() => {
      log.timeEnd(commandIdentifier);
      process.exit(0);
    })
    .catch((error) => {
      log.error(error.message);
      log.debug(error);
      process.exit(1);
    });
};

async function runCommand(command, argv) {
  const getConfig = async () => {
    const configPath = getOr(getOr(".whoopsie-config.yml", "c", argv), "config", argv);
    log.debug(`Reading config from ${configPath}`);
    const config = await processFile(configPath);

    if (argv.concurrency) {
      config.concurrency = argv.concurrency;
    }

    return config;
  };

  switch (command) {
    case "gallery":
      return runTestCommand(await getConfig(), ["gallery"]);

    case "test":
      return runTestCommand(await getConfig(), getReporters(argv.reporter));

    case "generate-gallery":
      return generateGallery(await getConfig());

    case "validate-config":
      return getConfig().then(() => console.log("Configuration is valid."));

    case "version":
      return console.log(pkg.version);

    case "help":
    default:
      return usage();
  }
}

async function runTestCommand(config, reporters) {
  const output = await test(config);

  return reportOutput(output, config, reporters);
}

async function generateGallery(config) {
  return fs.readJSON(config.inFile).then((output) => reporters.gallery(output, config));
}

function getReporters(reporterNames = DEFAULT_REPORTERS) {
  return [].concat(reporterNames);
}

function reportOutput(output, config, useReporters) {
  const reporterPromises = [];

  useReporters.forEach((reporterName) => {
    const reporter = reporters[reporterName];

    if (reporter) {
      reporterPromises.push(reporter(output, config));
    } else {
      log.warning(`Reporter "${reporterName}" does not exist`);
    }
  });

  return Promise.all(reporterPromises);
}

function usage() {
  console.log(`
Whoopsie v${pkg.version}

Usage:

  whoopsie test <configPath>              Run visual regression tests and output raw JSON results using the configuration at <configPath>
  whoopsie gallery <configPath>           Run visual regression tests and generate an HTML comparison gallery using the configuration at <configPath>
  whoopsie validate-config <configPath>   Validate configuration at <configPath>
  whoopsie generate-gallery <configPath>  Generate a gallery from JSON using the configuration at <configPath>
  whoopsie version                        Show the program version
  whoopsie help                           Show this message

Extra flags:

  --concurrency      Number of tests to run concurrently (default: one per CPU core)
  --verbose          Print test information while running (default: off)
  --debug            Print extra debugging information while running (default: off)
  --quiet            Only print errors and reporter output while running (default: off)

  `);
}
