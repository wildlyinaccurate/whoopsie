/* global phantom */
var page = require('webpage').create()
var args = require('system').args
var options = JSON.parse(args[1])

page.viewportSize = {
  width: options.width,
  height: options.width * 2
}

page.onError = page.onConsoleMessage = function () {
  // Prevent messages and errors from piping to stdout
}

page.open(options.url, function () {
  setTimeout(function () {
    page.evaluate(function (options) {
      options.ignoreSelectors.forEach(function (selector) {
        [].slice.call(document.querySelectorAll(selector)).forEach(function (node) {
          node.style.display = 'none'
        })
      })
    }, options)

    console.log(page.renderBase64('PNG'))
    phantom.exit()
  }, options.renderWaitTime)
})
