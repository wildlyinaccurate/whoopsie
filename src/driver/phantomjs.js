/* global phantom */
var page = require('webpage').create()
var args = require('system').args
var url = args[1]
var width = args[2]
var filename = args[3]

page.viewportSize = {
  width: width,
  height: width
}

page.open(url, function () {
  setTimeout(function() {
    console.log(page.renderBase64('PNG'))
    phantom.exit()
  }, 2000)
})
