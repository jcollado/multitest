#!/usr/bin/env node
'use strict'

const logger = require('./lib/logging').logger
const parseArguments = require('./lib/arguments').parseArguments

if (require.main === module) {
  const pkg = require('./package')
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
