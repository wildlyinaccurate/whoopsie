const compare = require('../src/compare')

describe('compare()', () => {
  it('should compare two captures', done => {
    // These are 8x8 GIF images. Both have a white background. One has a black
    // pixel in the top-left corner, the other in the bottom-right.
    const capture1 = { image: Buffer.from('R0lGODdhCAAIAIABAAAAAP///ywAAAAACAAIAAACB4yPqcvtDAoAOw==', 'base64') }
    const capture2 = { image: Buffer.from('R0lGODdhCAAIAIABAAAAAP///ywAAAAACAAIAAACB0SOqcvt3woAOw==', 'base64') }

    compare(capture1, capture2)
      .then(diff => {
        // The difference between the two images should be ~0.15%. These tests
        // reflect the fact that the diffing algorithm is not exact.
        expect(diff.results.percentage).toBeGreaterThan(0.1)
        expect(diff.results.percentage).toBeLessThan(0.2)

        done()
      })
  })
})
