const { some } = require('lodash/fp')
const puppeteer = require('puppeteer')
const DriverError = require('./driver-error')
const log = require('../log')

module.exports = {
  initialise,
  cleanUp,
  capturePage,
  captureSelectors
}

const DEFAULT_VIEWPORT_HEIGHT = 1000

let browser = null

async function initialise (config) {
  browser = await puppeteer.launch({
    headless: config.headless
  })

  const version = await browser.version()

  log.debug(`Browser version is ${version}`)
}

async function cleanUp () {
  await browser.close()
}

async function capturePage (imagePath, url, viewport, config) {
  const page = await loadPage(url, viewport, config)

  await page.screenshot({
    path: imagePath,
    fullPage: true
  })

  await page.close()
}

async function captureSelectors (selectors, url, viewport, config) {
  const page = await loadPage(url, viewport, config)

  const capturePromises = selectors.map(async function (selector) {
    const boundingClientRect = await page.evaluate(selector => {
      const element = document.querySelector(selector)

      if (!element) return false

      const rect = element.getBoundingClientRect()

      return JSON.stringify({
        x: rect.x,
        y: rect.y + window.pageYOffset,
        width: rect.width,
        height: rect.height
      })
    }, selector.selector)

    if (!boundingClientRect) {
      return new DriverError(`Element doesn't exist`)
    }

    await page.screenshot({
      clip: JSON.parse(boundingClientRect),
      path: selector.imagePath
    })

    return selector
  })

  return Promise.all(capturePromises).then(results => {
    page.close()

    return results
  })
}

async function loadPage (url, viewport, config) {
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
  try {
    await page.waitForNavigation(PAGE_LOAD_OPTIONS)
  } catch (error) {
    log.error(`Headless Chrome timed out while loading ${url} at ${width}px`)
    log.debug(error)
  }

  return page
}
