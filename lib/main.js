'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')

const promisify = require('promisify-node')
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
  let promise
  if (!fs.existsSync(outputDir)) {
    promise = fs.mkdir(outputDir)
    promise.then(function () {
      logger.debug('Directory created: %s', outputDir)
    })
  } else {
    promise = Promise.resolve()
  }
  return promise
    .then(function () {
      return Promise.all(travisConfig.node_js.map(function (version) {
        return runTests(outputDir, version)
      }))
    })
    .then(function (results) {
      const failures = results.filter(result => result.returnCode !== 0)
      if (failures.length > 0) {
        logger.error(
          'Test execution failed for: %s',
          failures.map(result => result.version)
        )
        return Promise.resolve(1)
      }

      logger.info('Test execution success')
      return Promise.resolve(0)
    })
}

function runTests (outputDir, version) {
  let promise
  const versionDir = path.join(outputDir, String(version))

  function execToPromise (resolve, reject) {
    return function (err, stdout, stderr) {
      logger.debug('[%s] stdout:\n%s', version, stdout)
      logger.debug('[%s] stderr:\n%s', version, stderr)
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    }
  }

  if (!fs.existsSync(versionDir)) {
    promise = fs.mkdir(versionDir)
    promise.then(function () {
      logger.debug('[%s] Directory created: %s', version, versionDir)
    })
  } else {
    promise = Promise.resolve()
  }
  return promise.then(function () {
    return new Promise(function (resolve, reject) {
      childProcess.exec(
        util.format('git clone . %s', versionDir),
        execToPromise(resolve, reject))
    })
  })
  .then(function () {
    logger.debug('[%s] Source code cloned', version)
  })
  .then(function () {
    const command = util.format(
      'source %s/nvm.sh && nvm use %s && npm install && npm test',
      process.env.NVM_DIR, version)
    logger.debug('[%s] command: %s', version, command)
    return new Promise(function (resolve, reject) {
      childProcess.exec(
        command,
        {shell: '/bin/bash', cwd: versionDir},
        execToPromise(resolve, reject)
      )
    })
  })
  .then(function () {
    logger.info('[%s] Test case execution success', version)
    return Promise.resolve({version, returnCode: 0})
  })
  .catch(function (err) {
    logger.error('[%s] %s', version, err.message)
    return Promise.resolve({version, returnCode: err.code})
  })
}

module.exports = main
