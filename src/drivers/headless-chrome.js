const { some } = require('lodash/fp')
const puppeteer = require('puppeteer')
const log = require('../log')

const DEFAULT_VIEWPORT_HEIGHT = 1000
const PAGE_LOAD_OPTIONS = {
  waitUntil: 'networkidle',
  networkIdleTimeout: 5000
}

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

module.exports.capture = async function (url, viewport, config) {
  const width = viewport.width
  const height = viewport.height || DEFAULT_VIEWPORT_HEIGHT
  const page = await browser.newPage()

  await page.setRequestInterceptionEnabled(true)
  await page.setViewport({ width, height })

  if (viewport.javascriptDisabled) {
    await page.setJavaScriptEnabled(false)
  }

  page.on('request', req => {
    const matchesRequest = pattern => (new RegExp(pattern)).test(req.url)

    if (some(matchesRequest, config.blockRequests)) {
      req.abort()
    } else {
      req.continue()
    }
  })

  try {
    await page.goto(url, PAGE_LOAD_OPTIONS)
  } catch (e) {
    log.error(`Failed to load ${url} at ${width}px. Reloading page to try again.`)

    await page.reload(PAGE_LOAD_OPTIONS)
  }

  const image = await page.screenshot({
    fullPage: true
  })

  await page.close()

  return image
}
