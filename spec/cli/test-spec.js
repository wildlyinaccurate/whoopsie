const proxyquire = require('proxyquire')

const mockCapture = (url, width) => `${url}@${width}`
const mockDiff = captures => {
  return {
    results: {},
    image: {},
    base: captures[0],
    test: captures[1]
  }
}

const captureSpy = jasmine.createSpy('capture').and.callFake(mockCapture)
const compareSpy = jasmine.createSpy('compare').and.callFake(mockDiff)
const gallerySpy = jasmine.createSpy('gallery')

const test = proxyquire('../../src/cli/test', {
  '../capture': captureSpy,
  '../compare': compareSpy,
  '../gallery': gallerySpy
})

describe('whoopsie test', () => {
  beforeEach(() => {
    captureSpy.calls.reset()
    compareSpy.calls.reset()
    gallerySpy.calls.reset()
  })

  it('should capture all permutations', done => {
    test({
      sites: ['http://localhost/live', 'http://localhost/test'],
      widths: [100, 120],
      urls: ['/1', '/2']
    }).then(() => {
      expect(captureSpy.calls.argsFor(0)).toEqual(['http://localhost/live/1', 100, {}])
      expect(captureSpy.calls.argsFor(1)).toEqual(['http://localhost/test/1', 100, {}])
      expect(captureSpy.calls.argsFor(2)).toEqual(['http://localhost/live/1', 120, {}])
      expect(captureSpy.calls.argsFor(3)).toEqual(['http://localhost/test/1', 120, {}])

      expect(captureSpy.calls.argsFor(4)).toEqual(['http://localhost/live/2', 100, {}])
      expect(captureSpy.calls.argsFor(5)).toEqual(['http://localhost/test/2', 100, {}])
      expect(captureSpy.calls.argsFor(6)).toEqual(['http://localhost/live/2', 120, {}])
      expect(captureSpy.calls.argsFor(7)).toEqual(['http://localhost/test/2', 120, {}])

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
        mockCapture('http://localhost/live/1', 100),
        mockCapture('http://localhost/test/1', 100)
      ])

      expect(compareSpy.calls.argsFor(1)).toEqual([
        mockCapture('http://localhost/live/2', 100),
        mockCapture('http://localhost/test/2', 100)
      ])

      done()
    })
  })

  it('should generate a gallery', done => {
    test({
      sites: ['http://localhost/live', 'http://localhost/test'],
      widths: [100],
      urls: ['/1', '/2'],
      gallery_dir: '/tmp',
      failure_threshold: 10
    }).then(() => {
      const capture1 = mockCapture('http://localhost/live/1', 100)
      const capture2 = mockCapture('http://localhost/test/1', 100)
      const capture3 = mockCapture('http://localhost/live/2', 100)
      const capture4 = mockCapture('http://localhost/test/2', 100)

      const diffs = [
        mockDiff(capture1, capture2),
        mockDiff(capture3, capture4)
      ]

      expect(gallerySpy.calls.argsFor(0)).toEqual(['/tmp', diffs, 10])

      done()
    })
  })
})
