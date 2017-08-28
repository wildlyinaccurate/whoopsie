/* eslint handle-callback-err: "off" */
const proxyquire = require('proxyquire')

const templateSpy = jasmine.createSpy('template').and.returnValue('MOCK HTML')

const gallery = proxyquire('../src/gallery', {
  'fs-extra': jasmine.createSpyObj('fs', ['readFile', 'writeFile', 'copy']),
  'lodash/fp': {
    template: () => templateSpy
  }
})

const mockDiff = percentage => {
  return {
    diff: {
      percentage,
      imagePath: '/tmp/diff.png'
    },
    base: { imagePath: '/tmp/base.png' },
    test: { imagePath: '/tmp/test.png' }
  }
}

describe('gallery()', () => {
  beforeEach(() => {
    templateSpy.calls.reset()
  })

  it('should order results by highest difference', done => {
    const diff1 = mockDiff(0.08)
    const diff2 = mockDiff(0.1)

    gallery('/tmp/whoopsie-test', [diff1, diff2], 10)
      .then(() => {
        const results = templateSpy.calls.argsFor(0)[0].results

        expect(results).toEqual([diff2, diff1])

        done()
      })
  })

  it('should correctly identify failures based on the threshold', done => {
    const diff1 = mockDiff(0.08)
    const diff2 = mockDiff(0.1)

    gallery('/tmp/whoopsie-test', [diff1, diff2], 10)
      .then(() => {
        const results = templateSpy.calls.argsFor(0)[0].results

        expect(results[0].failed).toBe(true)
        expect(results[1].failed).toBe(false)

        done()
      })
  })

  it('should ignore failed diffs', done => {
    const diff1 = undefined
    const diff2 = mockDiff(0.1)

    gallery('/tmp/whoopsie-test', [diff1, diff2], 10)
      .then(() => {
        const results = templateSpy.calls.argsFor(0)[0].results

        expect(results).toEqual([diff2])

        done()
      })
  })
})
