const testPermutations = require('../src/test-permutations')

describe('testPermutations()', () => {
  it('should generate (url, width) tuples', () => {
    const sites = ['http://site-1', 'http://site-2']
    const urls = ['/test-page']
    const widths = [100, 200]

    expect(testPermutations(sites, urls, widths)).toEqual([
      [['http://site-1/test-page', 100], ['http://site-2/test-page', 100]],
      [['http://site-1/test-page', 200], ['http://site-2/test-page', 200]]
    ])
  })

  it('should allow query parameters and ports in both sites and URLs', () => {
    const sites = ['http://site:8080?env=test', 'http://site?env=live']
    const urls = ['/test-page?other-param=true']
    const widths = [100, 200]

    expect(testPermutations(sites, urls, widths)).toEqual([
      [['http://site:8080/test-page?env=test&other-param=true', 100], ['http://site/test-page?env=live&other-param=true', 100]],
      [['http://site:8080/test-page?env=test&other-param=true', 200], ['http://site/test-page?env=live&other-param=true', 200]]
    ])
  })
})
