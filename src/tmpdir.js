const Promise = require('bluebird')
const fs = require('fs')
const mkdtemp = Promise.promisify(fs.mkdtemp)

const TMP_DIR = '/tmp/whoopsie-compare-'
const tmpdir = mkdtemp.bind(fs, TMP_DIR)

module.exports = tmpdir
