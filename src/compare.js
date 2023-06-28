const fs = require("fs-extra");
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
async function compare(baseCapture, testCapture) {
  const compareId = identifier("compare");

  log.info(`Comparing captures of ${baseCapture.page.url} and ${testCapture.page.url}`);
  log.debug(`Compare identifier is ${compareId}`);
  log.time(compareId);

  const [baseImageData, testImageData] = await Promise.all([
    fs.readFile(baseCapture.imagePath),
    fs.readFile(testCapture.imagePath),
  ]);

  let baseImage = PNG.sync.read(baseImageData);
  let testImage = PNG.sync.read(testImageData);

  const maxWidth = Math.max(baseImage.width, testImage.width);
  const maxHeight = Math.max(baseImage.height, testImage.height);

  if (baseImage.width !== testImage.width) {
    log.warn("Captured images are not the same width. Cannot proceed.");
  }

  if (baseImage.height < maxHeight) {
    log.debug(`Growing base image height from ${baseImage.height}px to ${maxHeight}px`);
    baseImage = { ...baseImage, height: maxHeight, data: growImageHeight(baseImage, maxHeight) };
  }

  if (testImage.height < maxHeight) {
    log.debug(`Growing test image height from ${testImage.height}px to ${maxHeight}px`);
    testImage = { ...testImage, height: maxHeight, data: growImageHeight(testImage, maxHeight) };
  }

  const diffImage = new PNG({ width: maxWidth, height: maxHeight });
  const diffPixels = pixelmatch(baseImage.data, testImage.data, diffImage.data, maxWidth, maxHeight);
  const diffImagePath = path.join(path.dirname(baseCapture.imagePath), `whoopsie-${compareId}.png`);
  fs.writeFileSync(diffImagePath, PNG.sync.write(diffImage));

  try {
    log.timeEnd(compareId);

    const totalPixels = maxWidth * maxHeight;
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

function growImageHeight(image, targetHeight) {
  const heightDiff = targetHeight - image.height;
  const diffBuffer = new Uint8Array(heightDiff * image.width * 4);

  for (let y = 0; y < heightDiff; y++) {
    for (let x = 0; x < image.width; x++) {
      const yi = (x + y) * 4;

      // Add a transparent pixel for each missing pixel
      diffBuffer[yi + 0] = 0;
      diffBuffer[yi + 1] = 0;
      diffBuffer[yi + 2] = 0;
      diffBuffer[yi + 3] = 0;
    }
  }

  return Buffer.concat([image.data, diffBuffer], targetHeight * image.width * 4);
}
