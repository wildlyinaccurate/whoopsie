const _ = require('lodash/fp')
const proxyquire = require('proxyquire')
const EventEmitter = require('events')

const mockProc = new EventEmitter()
mockProc.stdout = new EventEmitter()
const mockSpawn = jasmine.createSpy('spawn').and.returnValue(mockProc)

const capture = proxyquire('../lib/capture', {
  child_process: {
    spawn: mockSpawn
  },
  phantomjs: {
    path: '/fake/phantomjs'
  }
})

describe('capture()', () => {
  beforeEach(() => {
    mockSpawn.calls.reset()
  })

  it('should pass all options to PhantomJS', () => {
    const url = 'http://localhost/'
    const width = 200
    const opts = {
      ignoreSelectors: ['.foo', '.bar'],
      renderWaitTime: 2000
    }

    const expectedArgs = _.merge(opts, { url, width })

    capture(url, width, opts)

    expect(mockSpawn.calls.argsFor(0)[1]).toEqual(jasmine.arrayContaining([
      JSON.stringify(expectedArgs)
    ]))
  })

  it('should take base64 chunks from stdout', done => {
    const p = capture('http://localhost/', 200)
    const b1 = Buffer.from('Hello, ')
    const b2 = Buffer.from('world!')

    mockProc.stdout.emit('data', Buffer.from(b1.toString('base64')))
    mockProc.stdout.emit('data', Buffer.from(b2.toString('base64')))
    mockProc.emit('close')

    p.then(result => {
      expect(result.image.toString('ascii')).toEqual('Hello, world!')
      expect(result.url).toEqual('http://localhost/')
      expect(result.width).toEqual(200)

      done()
    })
  })
})
