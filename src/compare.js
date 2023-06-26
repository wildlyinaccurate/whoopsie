const fs = require("fs");
const path = require("path");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const log = require("./log");
const identifier = require("./identifier");

// compareCaptures :: [CaptureResult] -> [CaptureResult] -> [CompareResult]
module.exports = function compareCaptures(baseCaptures, testCaptures) {
  return Promise.all(baseCaptures.map((base, index) => compare(base, testCaptures[index])));
};

// compare :: CaptureResult -> CaptureResult -> CompareResult
function compare(baseCapture, testCapture) {
  const compareId = identifier("compare");

  log.info(`Comparing captures of ${baseCapture.page.url} and ${testCapture.page.url}`);
  log.debug(`Compare identifier is ${compareId}`);
  log.time(compareId);

  const expectedImage = PNG.sync.read(fs.readFileSync(baseCapture.imagePath));
  const actualImage = PNG.sync.read(fs.readFileSync(testCapture.imagePath));
  const { width, height } = expectedImage;
  const diffImage = new PNG({ width, height });

  const diffPixels = pixelmatch(expectedImage.data, actualImage.data, diffImage.data, width, height);
  const diffImagePath = path.join(path.dirname(baseCapture.imagePath), `whoopsie-${compareId}.png`);
  fs.writeFileSync(diffImagePath, PNG.sync.write(diffImage));

  try {
    log.timeEnd(compareId);

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    const result = {
      id: compareId,
      imagePath: diffImagePath,
      percentage: diffPercentage,
      total: diffPixels,
    };

    return new CompareResult(result, baseCapture, testCapture);
  } catch (error) {
    log.error("Unable to compare screenshots. The driver was probably unable to load one of the pages.");
    log.debug(`${compareId} diff generation failed: ${error}`);
  }
}

function CompareResult(diff, baseCapture, testCapture) {
  this.base = baseCapture;
  this.test = testCapture;
  this.diff = diff;
}
