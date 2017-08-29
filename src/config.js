const Promise = require('bluebird')
const fs = require('fs')
const schema = require('validate')
const yaml = require('js-yaml')

const DEFAULT_CONFIG = {
  browser: 'HeadlessChrome',
  blockRequests: [],
  failureThreshold: 10,
  networkIdleTimeout: 4000,
  fuzz: 5,
  galleryDir: 'results/',
  headless: true,
  ignoreSelectors: []
}

// process :: Object -> Promise<Object>
module.exports.process = function process (config) {
  const mergedConfig = Object.assign({}, DEFAULT_CONFIG, config)

  return new Promise((resolve, reject) => {
    const errors = makeSchema().validate(mergedConfig)

    if (errors.length > 0) {
      reject(makeError(errors))
    } else {
      resolve(mergedConfig)
    }
  })
}

// processFile :: String -> Promise<Object>
module.exports.processFile = function processFile (path) {
  return readConfigFile(path)
    .then(yaml.safeLoad)
    .then(module.exports.process)
}

function makeSchema () {
  return schema({
    sites: {
      type: 'array',
      required: true,
      use: x => x.length === 2,
      message: 'Exactly 2 "sites" values must be specified'
    },

    viewports: [
      {
        width: {
          type: 'number',
          required: true,
          message:
            'A "width" value must be specified for each "viewports" object'
        },
        isMobile: {
          type: 'boolean',
          message: 'The value for "isMobile" must be a boolean'
        }
      }
    ],

    pages: {
      type: 'array',
      required: true,
      use: x => x.length > 0,
      message: 'At least one "pages" value must be specified'
    },

    blockRequests: {
      type: 'array',
      required: true,
      message: 'The value for "blockRequests" must be an array'
    },

    browser: {
      type: 'string',
      required: true,
      message: 'A value is required for "browser"'
    },

    galleryDir: {
      type: 'string',
      required: true,
      message: 'A value is required for "galleryDir"'
    },

    failureThreshold: {
      type: 'number',
      required: true,
      message: 'A value is required for "failureThreshold"'
    },

    networkIdleTimeout: {
      type: 'number',
      required: true,
      message: 'A value is required for "networkIdleTimeout"'
    },

    ignoreSelectors: {
      type: 'array',
      message: 'The value for "ignoreSelectors" must be an array'
    },

    renderWaitTime: {
      type: 'number',
      message: 'The value for "renderWaitTime" must be a number'
    },

    fuzz: {
      type: 'number',
      message: 'The value for "fuzz" must be a number'
    },

    headless: {
      type: 'boolean',
      message: 'The value for "headless" must be a boolean'
    }
  })
}

function readConfigFile (path = '') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, contents) => {
      if (err) {
        reject(
          new Error('Configuration file does not exist or is not readable.')
        )
      } else {
        resolve(contents)
      }
    })
  })
}

function makeError (errors) {
  const combinedErrors = errors.map(e => `  * ${e.message}`).join('\n')

  return new Error(`Configuration validation failed.\n\n${combinedErrors}`)
}
