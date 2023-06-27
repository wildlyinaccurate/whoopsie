const crypto = require("crypto");

module.exports = function identifier(prefix = "") {
  return `${prefix}-${hash().substr(0, 8)}`;
};

function hash() {
  return crypto.createHash("sha1").update(Math.random().toString()).digest("hex");
}
