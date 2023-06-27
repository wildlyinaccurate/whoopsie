const fs = require("fs");
const os = require("os");
const schema = require("validate");
const yaml = require("js-yaml");

const DEFAULT_CONFIG = {
  blockRequests: [],
  browser: "HeadlessChrome",
  concurrency: os.cpus().length,
  failureThreshold: 10,
  fuzz: 5,
  headless: true,
  ignoreSelectors: [],
  inFile: "whoopsie/results.json",
  networkIdleTimeout: 500,
  outDir: "whoopsie/",
  scroll: true,
};

// process :: Object -> Promise<Object>
module.exports.process = function process(config) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return new Promise((resolve, reject) => {
    const errors = makeSchema().validate(mergedConfig);

    if (errors.length > 0) {
      reject(makeError(errors));
    } else {
      resolve(mergedConfig);
    }
  });
};

// processFile :: String -> Promise<Object>
module.exports.processFile = async function processFile(path) {
  return readConfigFile(path).then(yaml.safeLoad).then(module.exports.process);
};

function makeSchema() {
  return schema({
    sites: {
      type: "array",
      required: true,
      use: (x) => x.length === 2,
      message: 'Exactly 2 "sites" values must be specified',
    },

    viewports: [
      {
        width: {
          type: "number",
          required: true,
          message: 'A "width" value must be specified for each "viewports" object',
        },
        isMobile: {
          type: "boolean",
          message: 'The value for "isMobile" must be a boolean',
        },
      },
    ],

    pages: {
      type: "array",
      required: true,
      use: (x) => x.length > 0,
      message: 'At least one "pages" value must be specified',
    },

    blockRequests: {
      type: "array",
      required: true,
      message: 'The value for "blockRequests" must be an array',
    },

    browser: {
      type: "string",
      required: true,
      message: 'A value is required for "browser"',
    },

    inFile: {
      type: "string",
    },

    outDir: {
      type: "string",
      required: true,
      message: 'A value is required for "outDir"',
    },

    failureThreshold: {
      type: "number",
      required: true,
      message: 'A value is required for "failureThreshold"',
    },

    networkIdleTimeout: {
      type: "number",
      message: 'The value for for "networkIdleTimeout" must be numeric',
    },

    ignoreSelectors: {
      type: "array",
      message: 'The value for "ignoreSelectors" must be an array',
    },

    renderWaitTime: {
      type: "number",
      message: 'The value for "renderWaitTime" must be numeric',
    },

    fuzz: {
      type: "number",
      message: 'The value for "fuzz" must be numeric',
    },

    headless: {
      type: "boolean",
      message: 'The value for "headless" must be a boolean',
    },

    scroll: {
      type: "boolean",
      message: 'The value for "scroll" must be a boolean',
    },
  });
}

function readConfigFile(path = "") {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, contents) => {
      if (err) {
        reject(new Error("Configuration file does not exist or is not readable."));
      } else {
        resolve(contents);
      }
    });
  });
}

function makeError(errors) {
  const combinedErrors = errors.map((e) => `  * ${e.message}`).join("\n");

  return new Error(`Configuration validation failed.\n\n${combinedErrors}`);
}
