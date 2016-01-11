'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')

const rimraf = require('rimraf')
const yaml = require('js-yaml')

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

  const outputDir = '.' + pkg.name
  rimraf.sync(outputDir)
  logger.debug('Directory removed: %s', outputDir)
  fs.mkdirSync(outputDir)
  logger.debug('Directory created: %s', outputDir)

  travisConfig.node_js.forEach(function (version) {
    const versionDir = path.join(outputDir, String(version))
    fs.mkdirSync(versionDir)
    logger.debug('Directory created: %s', versionDir)

    childProcess.execSync(util.format('git clone . %s', versionDir))
    logger.debug('[%s] Source code cloned', version)

    childProcess.execSync('npm install')
    logger.debug('[%s] Installed dependencies', version)

    try {
      childProcess.execSync('npm test')
      logger.debug('[%s] Test cases executed', version)
    } catch (error) {
      logger.error(
        '[%s] %s', version, error.message)
    }
  })

  logger.info('Done!')
  return 0
}

module.exports = main
