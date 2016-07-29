/* global phantom */
var page = require('webpage').create()
var args = require('system').args
var options = JSON.parse(args[1])

page.viewportSize = {
  width: options.width,
  height: options.width * 2
}

page.onError = function (error) {
  log({ url: options.url, error: error }, 'ERROR')
}

page.onConsoleMessage = function (error) {
  log({ url: options.url, error: error })
}

page.open(options.url, function (status) {
  log({
    status: status,
    title: page.title,
    contentLength: page.content.length
  })

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

function log (obj, level) {
  obj.level = level || 'DEBUG'
  obj.url = options.url

  console.log(options.logMarker + JSON.stringify(obj))
}
