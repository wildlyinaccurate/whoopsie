const fs = require('fs')
const schema = require('validate')
const yaml = require('js-yaml')

// validate :: Object -> Promise<Object>
module.exports.validate = function validate (config) {
  return new Promise((resolve, reject) => {
    const errors = makeSchema().validate(config)

    if (errors.length > 0) {
      reject(makeError(errors))
    } else {
      resolve(config)
    }
  })
}

// validateFile :: String -> Promise<Object>
module.exports.validateFile = function validateFile (path) {
  return readConfigFile(path)
    .then(yaml.safeLoad)
    .then(module.exports.validate)
}

function makeSchema () {
  return schema({
    sites: {
      type: 'array',
      required: true,
      use: x => x.length === 2,
      message: 'Exactly 2 sites must be specified'
    },

    widths: {
      type: 'array',
      required: true,
      use: x => x.length > 0,
      message: 'At least one widths value must be specified'
    },

    urls: {
      type: 'array',
      required: true,
      use: x => x.length > 0,
      message: 'At least one urls value must be specified'
    },

    galleryDir: {
      type: 'string',
      required: true,
      message: 'A value is required for galleryDir'
    },

    failureThreshold: {
      type: 'number',
      required: true,
      message: 'A value is required for failureThreshold'
    },

    ignoreSelectors: {
      type: 'array',
      message: 'The value for ignoreSelectors must be an array'
    },

    renderWaitTime: {
      type: 'number',
      message: 'The value for renderWaitTime must be a number'
    },

    fuzz: {
      type: 'number',
      message: 'The value for fuzz must be a number'
    }
  })
}

function readConfigFile (path = '') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, contents) => {
      if (err) {
        reject(new Error('Configuration file does not exist or is not readable.'))
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
