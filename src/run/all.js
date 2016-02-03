'use strict'

const logger = require('../logging').logger
const pkg = require('../../package')
const util = require('../util')
const one = require('./one')

function runAllTests (versions) {
  const outputDir = '.' + pkg.name
  return util.exists(outputDir)
  .catch(function () {
    const dirPromise = util.mkdir(outputDir)
    dirPromise.then(function () {
      logger.debug('Directory created: %s', outputDir)
    })
    return dirPromise
  })
  .then(function () {
    return Promise.all(versions.map(function (version) {
      return one(outputDir, version)
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

module.exports = runAllTests
