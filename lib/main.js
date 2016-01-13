'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')

const yaml = require('js-yaml')

const logger = require('./logging').logger
const parseArguments = require('./arguments').parseArguments
const pkg = require('../package')

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
  return runAllTests(travisConfig.node_js)
}

function runAllTests (versions) {
  const outputDir = '.' + pkg.name
  return exists(outputDir)
  .catch(function () {
    const dirPromise = mkdir(outputDir)
    dirPromise.then(function () {
      logger.debug('Directory created: %s', outputDir)
    })
    return dirPromise
  })
  .then(function () {
    return Promise.all(versions.map(function (version) {
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
  const versionDir = path.join(outputDir, String(version))

  function execLog (subprocess) {
    logger.debug('[%s] command: %s', version, subprocess.command)
    logger.debug('[%s] stdout:\n%s', version, subprocess.stdout)
    logger.debug('[%s] stderr:\n%s', version, subprocess.stderr)
  }

  return exists(versionDir)
    .then(
      function () {
        const pullPromise = exec('git pull', {cwd: versionDir})
        pullPromise.then(execLog)
        return pullPromise
      },
      function () {
        const dirPromise = mkdir(versionDir)
        dirPromise.then(function () {
          logger.debug('[%s] Directory created: %s', version, versionDir)
        })
        const clonePromise = dirPromise.then(function () {
          return exec(util.format('git clone . %s', versionDir))
        })
        clonePromise.then(execLog)
        return clonePromise
      }
    )
    .then(function () {
      const command = util.format(
        'source %s/nvm.sh && nvm use %s && npm install && npm test',
        process.env.NVM_DIR, version)
      const testPromise = exec(command, {shell: '/bin/bash', cwd: versionDir})
      testPromise.then(execLog)
      return testPromise
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

function exec (command, options) {
  return new Promise(function (resolve, reject) {
    childProcess.exec(command, options, function (err, stdout, stderr) {
      if (err) {
        reject(err)
      } else {
        resolve({command, stdout, stderr})
      }
    })
  })
}

function mkdir (path) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(path, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function exists (path) {
  return new Promise(function (resolve, reject) {
    fs.exists(path, function (exists) {
      if (exists) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

module.exports = main
