const log = require('../src/log')

describe('log', () => {
  it('should log only the message', () => {
    spyOn(log.stream, 'write')

    log.error('野菜はおいしいです！')

    expect(log.stream.write).toHaveBeenCalledWith('野菜はおいしいです！\n')
  })
})
