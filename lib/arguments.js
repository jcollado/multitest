'use strict'

const program = require('commander')

function parseArguments (defaults, argv) {
  program
    .version(defaults.version)
    .description(defaults.description)
    .option('-l, --log-level [logLevel]',
            'Log level',
            /^(error|warn|info|verbose|debug|silly)$/i,
            defaults.logLevel)
    .parse(argv)

  return program
}

module.exports = {
  parseArguments
}
