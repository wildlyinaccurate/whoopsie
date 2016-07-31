/* eslint handle-callback-err: "off" */
const fs = require('fs')
const rimraf = require('rimraf')
const proxyquire = require('proxyquire')

const templateSpy = jasmine.createSpy('template').and.returnValue('MOCK HTML')

const gallery = proxyquire('../src/gallery', {
  'lodash/fp': {
    template: () => templateSpy
  }
})

const mockDiff = percentage => {
  return {
    results: { percentage },
    image: {},
    base: { image: {} },
    test: { image: {} }
  }
}

describe('gallery()', () => {
  beforeEach(() => {
    templateSpy.calls.reset()
  })

  it('should order results by highest difference', done => {
    const diff1 = mockDiff(0.08)
    const diff2 = mockDiff(0.1)

    fs.mkdtemp('/tmp/whoopsie-', (err, dir) => {
      gallery(dir, [diff1, diff2], 10)
        .then(() => {
          const results = templateSpy.calls.argsFor(0)[0].results

          expect(results).toEqual([diff2, diff1])

          rimraf(dir, done)
        })
    })
  })

  it('should correctly identify failures based on the threshold', done => {
    const diff1 = mockDiff(0.08)
    const diff2 = mockDiff(0.1)

    fs.mkdtemp('/tmp/whoopsie-', (err, dir) => {
      gallery(dir, [diff1, diff2], 10)
        .then(() => {
          const results = templateSpy.calls.argsFor(0)[0].results

          expect(results[0].failed).toBe(true)
          expect(results[1].failed).toBe(false)

          rimraf(dir, done)
        })
    })
  })

  it('should ignore failed diffs', done => {
    const diff1 = undefined
    const diff2 = mockDiff(0.1)

    fs.mkdtemp('/tmp/whoopsie-', (err, dir) => {
      gallery(dir, [diff1, diff2], 10)
        .then(() => {
          const results = templateSpy.calls.argsFor(0)[0].results

          expect(results).toEqual([diff2])

          rimraf(dir, done)
        })
    })
  })
})
