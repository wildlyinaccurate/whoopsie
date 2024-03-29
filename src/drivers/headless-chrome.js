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

  try {
    await page.screenshot({
      path: imagePath,
      fullPage: true,
    });
  } catch (e) {
    log.error(`Failed to capture full page screenshot for ${url}`);
    log.debug(e);
  }

  await page.close();
}

async function captureSelectors(selectors, url, viewport, config) {
  const page = await loadPage(url, viewport, config);

  const capturePromises = selectors.map(async function (selector) {
    const boundingClientRect = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();

      return JSON.stringify({ ...rect, y: rect.y + window.pageYOffset });
    }, selector.selector);

    try {
      return page.screenshot({
        clip: JSON.parse(boundingClientRect),
        path: selector.imagePath,
      });
    } catch (e) {
      log.error(`Failed to capture screenshot of selector ${selector.selector} for ${url}`);
      log.debug(e);
    }
  });

  return Promise.all(capturePromises).then(() => page.close());
}

async function loadPage(url, viewport, config) {
  const width = viewport.width;
  const height = viewport.height || DEFAULT_VIEWPORT_HEIGHT;

  log.debug("Setting up page");
  const page = await browser.newPage();
  await page.setViewport({ width, height });

  if (viewport.javascriptDisabled) {
    await page.setJavaScriptEnabled(false);
  }

  if (config.blockRequests && config.blockRequests.length) {
    await page.setRequestInterception(true);

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
    log.info(`Loading URL ${url}`);
    await page.goto(url);
  } catch (e) {
    log.warning(`Failed to load ${url} at ${width}px. Reloading page to try again.`);
    log.debug(e);

    await page.reload();
  }

  log.debug(`Waiting for network idle (${config.networkIdleTimeout} ms)`);
  await waitForNetworkIdle(page, config);

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
    await waitForNetworkIdle(page, config);
  }

  return page;
}

async function waitForNetworkIdle(page, config) {
  try {
    await page.waitForNetworkIdle({
      idleTime: config.networkIdleTimeout,
      timeout: config.maxNetworkIdleWait,
    });
  } catch (error) {
    log.warning(
      `Timed out while waiting ${config.maxNetworkIdleWait}ms for ${config.networkIdleTimeout}ms of network idle time`
    );
    log.debug(error);
  }
}
