const proxyquire = require('proxyquire')

const mockWhoopsie = {

}

const test = proxyquire('../../src/cli/test', {
  '../': mockWhoopsie
})

const testConfig = {
  sites: ['http://localhost/live', 'http://localhost/test'],
  widths: [100, 120, 130],
  urls: ['/1', '2']
}

describe('whoopsie test', () => {
  it('should capture all permutations', () => {
    test(testConfig)
  })
})
