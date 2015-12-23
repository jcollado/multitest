'use strict'

const logger = require('./logging').logger
const parseArguments = require('./arguments').parseArguments

function main () {
  const pkg = require('../package')
  const defaults = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    logLevel: 'info'
  }
  const program = parseArguments(defaults, process.argv)
  logger.level = program.logLevel

  logger.info('%s v%s', pkg.name, pkg.version)
  logger.info('Done!')
}

module.exports = main
