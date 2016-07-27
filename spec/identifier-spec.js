const identifier = require('../lib/identifier')

describe('identifier()', () => {
  it('should prefix identifiers', () => {
    expect(identifier('prefix').startsWith('prefix$')).toBe(true)
  })
})
