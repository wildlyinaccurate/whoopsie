module.exports = {
  // capture :: Url -> Width -> CaptureResult
  capture: require("./capture"),

  // compare :: CaptureResult -> CaptureResult -> Diff
  compare: require("./compare"),

  // gallery :: CaptureResult -> CaptureResult -> Diff -> HTML
  gallery: require("./gallery"),
};
