const proxyquire = require('proxyquire')

const captureSpy = jasmine.createSpy('capture').and.callFake((url, width) => [url, width])
const compareSpy = jasmine.createSpy('compare').and.returnValue({
  results: { percentage: 0 },
  base: { url: 'MOCK', width: 0 },
  test: { url: 'MOCK', width: 0 }
})

const test = proxyquire('../../src/cli/test', {
  '../capture': captureSpy,
  '../compare': compareSpy
})

describe('whoopsie test', () => {
  beforeEach(() => {
    captureSpy.calls.reset()
    compareSpy.calls.reset()
  })

  it('should capture all permutations', done => {
    test({
      sites: ['http://localhost/live', 'http://localhost/test'],
      widths: [100, 120],
      urls: ['/1', '/2']
    }).then(() => {
      expect(captureSpy.calls.argsFor(0)).toEqual(['http://localhost/live/1', 100])
      expect(captureSpy.calls.argsFor(1)).toEqual(['http://localhost/test/1', 100])
      expect(captureSpy.calls.argsFor(2)).toEqual(['http://localhost/live/1', 120])
      expect(captureSpy.calls.argsFor(3)).toEqual(['http://localhost/test/1', 120])

      expect(captureSpy.calls.argsFor(4)).toEqual(['http://localhost/live/2', 100])
      expect(captureSpy.calls.argsFor(5)).toEqual(['http://localhost/test/2', 100])
      expect(captureSpy.calls.argsFor(6)).toEqual(['http://localhost/live/2', 120])
      expect(captureSpy.calls.argsFor(7)).toEqual(['http://localhost/test/2', 120])

      done()
    })
  })

  it('should compare the correct captures', done => {
    test({
      sites: ['http://localhost/live', 'http://localhost/test'],
      widths: [100],
      urls: ['/1', '/2']
    }).then(() => {
      expect(compareSpy.calls.argsFor(0)).toEqual([
        ['http://localhost/live/1', 100],
        ['http://localhost/test/1', 100]
      ])

      expect(compareSpy.calls.argsFor(1)).toEqual([
        ['http://localhost/live/2', 100],
        ['http://localhost/test/2', 100]
      ])

      done()
    })
  })
})
