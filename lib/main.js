'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

const logger = require('./logging').logger
const parseArguments = require('./arguments').parseArguments
const pkg = require('../package')
const run = require('./run')

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

  const travisFile = path.join(process.cwd(), '.travis.yml')
  if (!fs.existsSync(travisFile)) {
    logger.error('Travis file not found: %s', travisFile)
    return 1
  }

  const travisConfig = yaml.safeLoad(fs.readFileSync(travisFile))
  if (typeof travisConfig.node_js === 'undefined') {
    logger.error('language field not found in travis configuration')
    return 1
  }

  if (travisConfig.language !== 'node_js') {
    logger.error(
      'Unexpected language in travis configuration: %s', travisConfig.language)
    return 1
  }

  if (typeof travisConfig.node_js === 'undefined') {
    logger.error('node_js field not found in travis configuration')
    return 1
  }
  logger.info('Node versions to use for testing: %s', travisConfig.node_js)
  return run(travisConfig.node_js)
}

module.exports = main
