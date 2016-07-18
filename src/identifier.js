module.exports = function identifier (prefix = '') {
  return `${prefix}$${Math.floor(Math.random() * 10E8)}`
}
