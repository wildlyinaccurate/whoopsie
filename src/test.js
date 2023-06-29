const { compose, filter, map, set } = require("lodash/fp");
const Queue = require("queue");
const testPermutations = require("./test-permutations");
const capture = require("./capture");
const compare = require("./compare");
const drivers = require("./drivers");
const log = require("./log");

module.exports = async function test(config) {
  const driver = drivers[config.browser];
  const concurrency = Math.ceil(config.concurrency / 2);

  if (!driver) {
    throw new Error(`Unsupported browser "${config.browser}"`);
  }

  log.info(`Running tests in ${config.browser} with concurrency = ${config.concurrency}`);

  const results = [];
  const testPairs = testPermutations(config.sites.slice(0, 2), config.pages, config.viewports);
  const q = new Queue({ concurrency });

  q.on("success", (result) => results.push(...result));

  await driver.initialise(config);

  testPairs.forEach((pair) => {
    // Viewport is the same for both tuples
    const [page, viewport] = pair[0];

    q.push((cb) => {
      log.notice(`Testing ${page.name || page.path} at ${viewport.width}px`);

      capturePair(driver, pair, config)
        .then(diffCaptures)
        .then(map(set("viewport", viewport)))
        .then(map(setPassedAndFailed(config.failureThreshold)))
        .then((results) => cb(null, results));
    });
  });

  return new Promise((resolve) => {
    q.start(() => {
      driver.cleanUp();

      resolve(new TestResult(results));
    });
  });
};

async function capturePair(driver, pair, config) {
  const makeCapture = ([page, viewport]) => capture(driver, page, viewport, config);

  return Promise.all(pair.map(makeCapture));
}

async function diffCaptures([base, test]) {
  return compare(base, test);
}

function setPassedAndFailed(failureThreshold) {
  return (result) =>
    compose(
      set("failed", result.diff.percentage >= failureThreshold),
      set("passed", result.diff.percentage < failureThreshold)
    )(result);
}

function TestResult(results) {
  this.summary = makeSummary(results);
  this.results = results;
}

function makeSummary(results) {
  const total = results.length;
  const failures = filter("failed", results).length;
  const passes = total - failures;

  return { total, failures, passes };
}
