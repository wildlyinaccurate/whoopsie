const _ = require('lodash')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
const path = require('path')
const crypto = require('crypto')

module.exports = function gallery (baseDir, diffs, failureThreshold) {
  const galleryDir = path.join(baseDir, galleryName())

  return fs.readFileAsync(templatePath(), 'utf8')
    .then(_.template)
    .then(template => {
      const results = processDiffs(diffs, failureThreshold)

      return template({
        results,
        summary: makeSummary(results),
        failureThreshold,
        time: new Date()
      })
    })
    .then(html => [html, mkdirp(galleryDir)])
    .all()
    .then(([html]) => fs.writeFileAsync(path.join(galleryDir, 'index.html'), html))
}

function templatePath () {
  return path.join(__dirname, 'template/gallery.html')
}

function makeSummary (diffs) {
  const total = diffs.length
  const failures = _.filter(diffs, 'failed').length
  const passes = total - failures

  return { total, failures, passes }
}

function processDiffs (diffs, failureThreshold) {
  const annotated = diffs.map(diff => {
    diff.failed = diff.results.percentage >= (failureThreshold / 100)

    return diff
  })

  return _.orderBy(annotated, 'results.percentage', 'desc')
}

function galleryName () {
  return crypto.createHash('sha1')
    .update(new Date().toJSON())
    .digest('hex')
    .substr(0, 12)
}
