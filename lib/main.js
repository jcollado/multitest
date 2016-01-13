'use strict'

const logger = require('./logging').logger
const parseArguments = require('./arguments').parseArguments
const pkg = require('../package')
const run = require('./run')
const travis = require('./travis')

function main () {
  const defaults = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    logLevel: 'info'
  }
  const program = parseArguments(defaults, process.argv)
  logger.level = program.logLevel

  logger.info('%s v%s', pkg.name, pkg.version)

  return travis()
    .then(run, function () {
      return Promise.resolve(1)
    })
}

module.exports = main
