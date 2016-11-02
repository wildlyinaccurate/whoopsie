const { format, parse } = require('url')
const { chunk, merge } = require('lodash/fp')
const product = require('cartesian-product')

// Generate a list of pairs which contain (url, width) tuples representing all
// permutations of the sites, urls, and widths provided.
//
// The permutations will be ordered such that each pair contains the same url
// and width for each site.
module.exports = function testPermutations (sites, urls, widths) {
  const pairs = chunk(2)

  return pairs(
    product([urls, widths, sites]).map(makeTuple)
  )
}

function makeTuple ([path, width, site]) {
  const siteUrl = parse(site, true)
  const pathUrl = parse(path, true)

  siteUrl.pathname = mergePathnames(siteUrl.pathname, pathUrl.pathname)
  siteUrl.query = merge(siteUrl.query, pathUrl.query)
  siteUrl.search = undefined

  return [format(siteUrl), width]
}

function mergePathnames (path1, path2) {
  return (path1 === '/' ? '' : path1) + path2
}
