const config = require('../src/config')

const minimumValidConfig = {
  sites: ['site1', 'site2'],
  widths: [200, 300],
  urls: ['/'],
  galleryDir: 'results/',
  failureThreshold: 10
}

describe('config.validateFile()', () => {
  it('should accept a valid config file', done => {
    config.validateFile('config/sample.yaml').then(done)
  })

  it('should reject an invalid config file', done => {
    config.validateFile('spec/support/invalid-config.yaml').catch(done)
  })

  it('should reject when the file does not exist', done => {
    config.validateFile('-').catch(done)
  })
})

describe('config.validate()', () => {
  it('should accept a minimum valid config', done => {
    config.validate(minimumValidConfig)
      .then(actualConfig => {
        expect(actualConfig).toEqual(minimumValidConfig)
        done()
      })
  })

  it('should reject config with no sites', done => {
    config.validate(modifyConfig({ sites: [] })).catch(done)
  })

  it('should reject config with one site', done => {
    config.validate(modifyConfig({ sites: ['site1'] })).catch(done)
  })

  it('should reject config with more than two sites', done => {
    config.validate(modifyConfig({ sites: ['site1', 'site2', 'site3'] })).catch(done)
  })

  it('should reject config with no widths', done => {
    config.validate(modifyConfig({ widths: [] })).catch(done)
  })

  it('should reject config with no urls', done => {
    config.validate(modifyConfig({ urls: [] })).catch(done)
  })

  it('should reject config with no galleryDir', done => {
    const invalidConfig = modifyConfig({})
    delete invalidConfig.galleryDir

    config.validate(invalidConfig).catch(done)
  })

  it('should reject config with no failureThreshold', done => {
    const invalidConfig = modifyConfig({})
    delete invalidConfig.failureThreshold

    config.validate(invalidConfig).catch(done)
  })

  it('should accept a config with optional values', done => {
    config.validate(modifyConfig({ ignoreSelectors: ['.foo'], renderWaitTime: 2000, fuzz: 5 })).then(done)
  })
})

function modifyConfig (changes) {
  return Object.assign({}, minimumValidConfig, changes)
}
