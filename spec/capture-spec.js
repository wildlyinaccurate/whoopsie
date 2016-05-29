const proxyquire = require('proxyquire')
const EventEmitter = require('events')

const mockProc = new EventEmitter()
mockProc.stdout = new EventEmitter()
const mockSpawn = jasmine.createSpy('spawn').and.returnValue(mockProc)

const capture = proxyquire('../src/capture', {
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
    const opts = {
      ignoreSelectors: ['.foo', '.bar'],
      renderWaitTime: 2000
    }

    capture('http://localhost/', 200, opts)

    expect(mockSpawn.calls.argsFor(0)[1]).toEqual(jasmine.arrayContaining([
      'http://localhost/',
      200,
      JSON.stringify(opts)
    ]))
  })

  it('should take base64 chunks from stdout', (done) => {
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
