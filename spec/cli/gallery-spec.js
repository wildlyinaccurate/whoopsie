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
const gallerySpy = jasmine.createSpy('gallery').and.returnValue(Promise.resolve(null))

const test = proxyquire('../../src/cli/test', {
  '../capture': captureSpy,
  '../compare': compareSpy
})

const gallery = proxyquire('../../src/cli/gallery', {
  './test': test,
  '../gallery': gallerySpy
})

describe('whoopsie gallery', () => {
  beforeEach(() => {
    gallerySpy.calls.reset()
  })

  it('should generate a gallery', done => {
    gallery({
      sites: ['http://localhost/live', 'http://localhost/test'],
      widths: [100],
      urls: ['/1', '/2'],
      galleryDir: '/tmp',
      failureThreshold: 10
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
