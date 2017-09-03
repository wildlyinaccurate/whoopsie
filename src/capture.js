const path = require('path')
const os = require('os')
const log = require('./log')
const identifier = require('./identifier')

module.exports = async function capture (driver, page, viewport, config) {
  const { width } = viewport
  const captureId = identifier('capture')

  log.info(`Capturing ${page.url} at ${width}px`)
  log.debug(`Capture identifier is ${captureId}`)
  log.time(captureId)

  const results = await doCapture(driver, captureId, page, viewport, config)

  log.timeEnd(captureId)

  return results
}

async function doCapture (driver, captureId, page, viewport, config) {
  if (page.selectors) {
    const selectorObjs = page.selectors.map(
      (selector, index) =>
        new SelectorCaptureResult(
          selector,
          captureId,
          page,
          makeImagePath(`${captureId}-${index}`)
        )
    )

    const captureResults = await driver.captureSelectors(
      selectorObjs,
      page.url,
      viewport,
      config
    )

    return captureResults.map((result, index) => {
      if (result.error) {
        // A (hopefully) short-term hack to avoid a big refactor.
        // Always return the original SelectorCaptureResult, but just set the
        // "error" property if the capture failed and let downstream units
        // handle it
        return Object.assign(selectorObjs[index], { error: result.error })
      }

      return result
    })
  } else {
    const imagePath = makeImagePath(captureId)
    await driver.capturePage(imagePath, page.url, viewport, config)

    return [new PageCaptureResult(captureId, page, imagePath)]
  }
}

function makeImagePath (suffix) {
  return path.join(os.tmpdir(), `whoopsie-${suffix}.png`)
}

function PageCaptureResult (id, page, imagePath) {
  this.type = 'page'
  this.id = id
  this.page = page
  this.imagePath = imagePath
}

function SelectorCaptureResult (selector, id, page, imagePath) {
  this.type = 'selector'
  this.selector = selector
  this.id = id
  this.page = page
  this.imagePath = imagePath
}
