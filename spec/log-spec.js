const proxyquire = require('proxyquire')
const Log = require('log')

const consoleSpy = jasmine.createSpyObj('console', ['time', 'timeEnd'])
const log = proxyquire('../src/log', {
  'console': consoleSpy
})

describe('log', () => {
  beforeEach(() => {
    consoleSpy.time.calls.reset()
    consoleSpy.timeEnd.calls.reset()
  })

  it('should log only the message', () => {
    spyOn(log.stream, 'write')

    log.critical('野菜はおいしいです！')

    expect(log.stream.write).toHaveBeenCalledWith('野菜はおいしいです！\n')
  })

  it('should prefix errors with "ERROR:"', () => {
    spyOn(log.stream, 'write')

    log.error('Everything broke!')

    expect(log.stream.write).toHaveBeenCalledWith('ERROR: Everything broke!\n')
  })

  it('should not use time and timeEnd when the level is higher than DEBUG', () => {
    log.level = Log.INFO
    log.time('test')
    log.timeEnd('test')

    expect(consoleSpy.time).not.toHaveBeenCalled()
    expect(consoleSpy.timeEnd).not.toHaveBeenCalled()
  })

  it('should use time and timeEnd when the level is DEBUG', () => {
    log.level = Log.DEBUG
    log.time('test')
    log.timeEnd('test')

    expect(consoleSpy.time).toHaveBeenCalledWith('test')
    expect(consoleSpy.timeEnd).toHaveBeenCalledWith('test')
  })
})
