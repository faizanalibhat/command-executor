const { createWriteStream } = require('node:fs');

module.exports = (options) => {
  return createWriteStream(options.destination)
}