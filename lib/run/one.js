'use strict'

const path = require('path')

const logger = require('../logging').logger
const util = require('../util')

function runTests (outputDir, version) {
  const versionDir = path.join(outputDir, String(version))

  function execLog (subprocess) {
    logger.debug('[%s] command: %s', version, subprocess.command)
    logger.debug('[%s] stdout:\n%s', version, subprocess.stdout)
    logger.debug('[%s] stderr:\n%s', version, subprocess.stderr)
  }

  return util.exists(versionDir)
    .then(
      function () {
        const branchNamePromise = util.exec('git rev-parse --abbrev-ref HEAD')
        branchNamePromise.then(execLog)
        const pullPromise = branchNamePromise.then(function (subprocess) {
          const branchName = subprocess.stdout.trimRight()
          return util.exec(`git fetch && git checkout ${branchName} && git pull`, {shell: '/bin/bash', cwd: versionDir})
        })
        pullPromise.then(execLog)
        return pullPromise
      },
      function () {
        const dirPromise = util.mkdir(versionDir)
        dirPromise.then(function () {
          logger.debug('[%s] Directory created: %s', version, versionDir)
        })
        const clonePromise = dirPromise.then(function () {
          return util.exec(`git clone . ${versionDir}`)
        })
        clonePromise.then(execLog)
        return clonePromise
      }
    )
    .then(function () {
      const command = `source ${process.env.NVM_DIR}/nvm.sh && nvm use ${version} && npm prune && npm install && npm test`
      const testPromise = util.exec(command, {shell: '/bin/bash', cwd: versionDir})
      testPromise.then(execLog)
      return testPromise
    })
    .then(function () {
      logger.info('[%s] Test case execution success', version)
      return Promise.resolve({version, returnCode: 0})
    })
    .catch(function (err) {
      logger.error('[%s] %s', version, err.message)
      return Promise.resolve({version, returnCode: err.code || 1})
    })
}

module.exports = runTests
