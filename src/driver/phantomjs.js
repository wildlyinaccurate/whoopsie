/* global phantom */
var page = require('webpage').create()
var args = require('system').args
var url = args[1]
var width = args[2]
var options = JSON.parse(args[3])

page.viewportSize = {
  width: width,
  height: width
}

page.open(url, function () {
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
