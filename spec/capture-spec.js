const { merge } = require('lodash/fp')
const proxyquire = require('proxyquire')
const EventEmitter = require('events')

const noOp = _ => _
const mockProc = new EventEmitter()
mockProc.stdout = new EventEmitter()
const mockSpawn = jasmine.createSpy('spawn').and.returnValue(mockProc)
const mockLog = jasmine.createSpy('log')

const capture = proxyquire('../src/capture', {
  child_process: {
    spawn: mockSpawn
  },
  phantomjs: {
    path: '/fake/phantomjs'
  },
  './log': {
    log: mockLog,
    debug: noOp,
    info: noOp
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
      renderWaitTime: 2000,
      logMarker: '#LOG#'
    }

    const expectedArgs = merge(opts, { url, width })

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

  it('should log errors from the client', done => {
    const p = capture('http://localhost/', 200)
    const log = {
      level: 'ERROR',
      message: 'Hello from the client!'
    }

    mockProc.stdout.emit('data', Buffer.from(`#LOG#${JSON.stringify(log)}`))
    mockProc.emit('close')

    p.then(() => {
      const logArgs = mockLog.calls.argsFor(0)

      expect(logArgs[0]).toEqual('ERROR')
      expect(JSON.parse(logArgs[1][1])).toEqual({ message: 'Hello from the client!' })

      done()
    })
  })
})
