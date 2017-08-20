const proxyquire = require('proxyquire')

const noOp = _ => _
const logSpy = jasmine.createSpy('log')

const capture = proxyquire('../src/capture', {
  './log': {
    log: logSpy,
    debug: noOp,
    info: noOp
  }
})

describe('capture()', () => {
  it('???', () => {
    expect(capture).toBeDefined()
  })
})
