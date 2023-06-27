const { some } = require("lodash/fp");
const puppeteer = require("puppeteer");
const log = require("../log");

module.exports = {
  initialise,
  cleanUp,
  capturePage,
  captureSelectors,
};

const DEFAULT_VIEWPORT_HEIGHT = 1000;

let browser = null;

async function initialise(config) {
  browser = await puppeteer.launch({
    headless: config.headless ? "new" : false,
  });

  const version = await browser.version();

  log.debug(`Browser version is ${version}`);
}

async function cleanUp() {
  await browser.close();
}

async function capturePage(imagePath, url, viewport, config) {
  const page = await loadPage(url, viewport, config);

  await page.screenshot({
    path: imagePath,
    fullPage: true,
  });

  await page.close();
}

async function captureSelectors(selectors, url, viewport, config) {
  const page = await loadPage(url, viewport, config);

  const capturePromises = selectors.map(async function (selector) {
    const boundingClientRect = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();

      return JSON.stringify(
        Object.assign(rect, {
          y: rect.y + window.pageYOffset,
        })
      );
    }, selector.selector);

    return page.screenshot({
      clip: JSON.parse(boundingClientRect),
      path: selector.imagePath,
    });
  });

  return Promise.all(capturePromises).then(() => page.close());
}

async function loadPage(url, viewport, config) {
  const width = viewport.width;
  const height = viewport.height || DEFAULT_VIEWPORT_HEIGHT;

  log.debug("Setting up page");
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  await page.setViewport({ width, height });

  if (viewport.javascriptDisabled) {
    await page.setJavaScriptEnabled(false);
  }

  if (config.blockRequests && config.blockRequests.length) {
    // Request interceptor to block requests that match the "blockRequests" config
    page.on("request", (req) => {
      const matchesRequest = (pattern) => new RegExp(pattern).test(req.url);

      if (some(matchesRequest, config.blockRequests)) {
        log.debug(`Blocking request ${req.url} on ${url}`);
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  try {
    log.debug(`Loading URL ${url}`);
    await page.goto(url);
  } catch (e) {
    log.error(`Failed to load ${url} at ${width}px. Reloading page to try again.`);

    await page.reload();
  }

  log.debug(`Waiting for network idle (${config.networkIdleTimeout} ms)`);
  try {
    await page.waitForNetworkIdle({
      idleTime: config.networkIdleTimeout,
      timeout: Math.max(config.networkIdleTimeout, 30000),
    });
  } catch (error) {
    log.error("Timed out while waiting for network idle");
    log.debug(error);
  }

  // Set all "ignoredSelectors" elements to display: none
  if (config.ignoreSelectors && config.ignoreSelectors.length) {
    log.debug(`Hiding ignored selectors: ${JSON.stringify(config.ignoreSelectors)}`);
    await page.evaluate((selectors) => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          element.style.display = "none";
        });
      });
    }, config.ignoreSelectors);
  }

  // Scroll to the bottom of the page to trigger any lazy-loading
  if (config.scroll) {
    log.debug("Scrolling to page end");
    await page.evaluate(() => {
      window.scrollTo(0, document.body.clientHeight);
    });

    // Wait for any navigation triggered by lazy-loading to finish
    log.debug(`Waiting for network idle in case of lazy-loaded content (${config.networkIdleTimeout} ms)`);
    try {
      await page.waitForNetworkIdle({
        idleTime: config.networkIdleTimeout,
        timeout: Math.max(config.networkIdleTimeout, 30000),
      });
    } catch (error) {
      log.error("Timed out while waiting for network idle");
      log.debug(error);
    }
  }

  return page;
}
