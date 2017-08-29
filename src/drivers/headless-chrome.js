const { some } = require('lodash/fp')
const puppeteer = require('puppeteer')
const log = require('../log')

const DEFAULT_VIEWPORT_HEIGHT = 1000

let browser = null

module.exports.initialise = async function (config) {
  browser = await puppeteer.launch({
    headless: config.headless
  })

  const version = await browser.version()

  log.debug(`Browser version is ${version}`)
}

module.exports.cleanUp = async function () {
  await browser.close()
}

module.exports.capture = async function (imagePath, url, viewport, config) {
  const PAGE_LOAD_OPTIONS = {
    waitUntil: 'networkidle',
    networkIdleTimeout: config.networkIdleTimeout
  }
  const width = viewport.width
  const height = viewport.height || DEFAULT_VIEWPORT_HEIGHT
  const page = await browser.newPage()

  await page.setRequestInterceptionEnabled(true)
  await page.setViewport({ width, height })

  if (viewport.javascriptDisabled) {
    await page.setJavaScriptEnabled(false)
  }

  // Request interceptor to block requests that match the "blockRequests" config
  page.on('request', req => {
    const matchesRequest = pattern => new RegExp(pattern).test(req.url)

    if (some(matchesRequest, config.blockRequests)) {
      log.debug(`Blocking request ${req.url} on ${url}`)
      req.abort()
    } else {
      req.continue()
    }
  })

  try {
    await page.goto(url, PAGE_LOAD_OPTIONS)
  } catch (e) {
    log.error(
      `Failed to load ${url} at ${width}px. Reloading page to try again.`
    )

    await page.reload(PAGE_LOAD_OPTIONS)
  }

  // Set all "ignoredSelectors" elements to display: none
  await page.evaluate(selectors => {
    document.querySelectorAll(selectors).forEach(element => {
      element.style.display = 'none'
    })
  }, config.ignoreSelectors)

  // Scroll to the bottom of the page to trigger any lazy-loading
  await page.evaluate(() => {
    window.scrollTo(0, document.body.clientHeight)
  })

  // Wait for any navigation triggered by lazy-loading to finish
  await page.waitForNavigation(PAGE_LOAD_OPTIONS)

  await page.screenshot({
    path: imagePath,
    fullPage: true
  })

  await page.close()
}
