const validate = require('../../src/config').validate

const minimumValidConfig = {
  sites: ['site1', 'site2'],
  widths: [200, 300],
  urls: ['/'],
  galleryDir: 'results/',
  failureThreshold: 10
}

describe('config.validate()', () => {
  it('should accept a minimum valid config', done => {
    validate(minimumValidConfig)
      .then(actualConfig => {
        expect(actualConfig).toEqual(minimumValidConfig)
        done()
      })
  })

  it('should reject config with no sites', done => {
    validate(modifyConfig({ sites: [] })).catch(done)
  })

  it('should reject config with one site', done => {
    validate(modifyConfig({ sites: ['site1'] })).catch(done)
  })

  it('should reject config with more than two sites', done => {
    validate(modifyConfig({ sites: ['site1', 'site2', 'site3'] })).catch(done)
  })

  it('should reject config with no widths', done => {
    validate(modifyConfig({ widths: [] })).catch(done)
  })

  it('should reject config with no urls', done => {
    validate(modifyConfig({ urls: [] })).catch(done)
  })

  it('should reject config with no galleryDir', done => {
    const config = modifyConfig({})
    delete config.galleryDir

    validate(config).catch(done)
  })

  it('should reject config with no failureThreshold', done => {
    const config = modifyConfig({})
    delete config.failureThreshold

    validate(config).catch(done)
  })

  it('should accept a config with optional values', done => {
    validate(modifyConfig({ ignoreSelectors: ['.foo'], renderWaitTime: 2000, fuzz: 5 })).then(done)
  })
})

function modifyConfig (changes) {
  return Object.assign({}, minimumValidConfig, changes)
}
