module.exports = {
  // capture :: Url -> Width -> CaptureResult
  capture: require('./capture'),

  // compare :: CaptureResult -> CaptureResult -> Diff
  compare: require('./compare'),

  // gallery :: CaptureResult -> CaptureResult -> Diff -> HTML
  gallery: require('./gallery')
}

const width = 400
const ps = [
  module.exports.capture('https://duckduckgo.com/?q=random+number&t=canonical&ia=answer', width),
  module.exports.capture('https://duckduckgo.com/?q=random+number&t=canonical&ia=answer', width)
]

Promise.all(ps)
  .then(([c1, c2]) => module.exports.compare(c1, c2))
  .then(diff => require('fs').writeFileSync('image.html', `<h3>${diff.percentage}% difference</h3><img src="data:image/png;base64,${diff.image.toString('base64')}">`))
