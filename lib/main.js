'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')

const promisify = require('promisify-node')
const rimraf = promisify(require('rimraf'))
const yaml = require('js-yaml')

promisify(fs)

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
  return rimraf(outputDir)
    .then(function () {
      logger.debug('Directory removed: %s', outputDir)
      return fs.mkdir(outputDir)
    }).then(function () {
      logger.debug('Directory created: %s', outputDir)

      return Promise.all(travisConfig.node_js.forEach(function (version) {
        return runTests(outputDir, version)
      }))
    }).then(function () {
      logger.info('Done!')
      return Promise.resolve(0)
    })
}

function runTests (outputDir, version) {
  const versionDir = path.join(outputDir, String(version))
  return fs.mkdir(versionDir)
    .then(function () {
      logger.debug('Directory created: %s', versionDir)

      childProcess.execSync(util.format('git clone . %s', versionDir))
      logger.debug('[%s] Source code cloned', version)

      try {
        const command = util.format(
            'source %s/nvm.sh && nvm use %s && npm install && npm test',
            process.env.NVM_DIR, version)
        logger.debug('[%s] command: %s', version, command)
        childProcess.execSync(command, {shell: '/bin/bash'})
        logger.debug('[%s] Test cases executed', version)
      } catch (error) {
        logger.error(
          '[%s] %s', version, error.message)
      }
    })
}

module.exports = main
