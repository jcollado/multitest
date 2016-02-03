import path from 'path'

import {logger} from '../logging'
import util from '../util'

export default function runTests (outputDir, version) {
  const versionDir = path.join(outputDir, String(version))

  function execLog (subprocess) {
    logger.debug('[%s] command: %s', version, subprocess.command)
    logger.debug('[%s] stdout:\n%s', version, subprocess.stdout)
    logger.debug('[%s] stderr:\n%s', version, subprocess.stderr)
    return subprocess
  }

  return util.exists(versionDir)
    .then(
      function () {
        return util.exec('git rev-parse --abbrev-ref HEAD')
          .then(execLog)
          .then(function (subprocess) {
            const branchName = subprocess.stdout.trimRight()
            return util.exec(`git fetch && git checkout --force ${branchName} && git reset --hard origin/${branchName} && git pull`, {shell: '/bin/bash', cwd: versionDir})
          })
          .then(execLog)
      },
      function () {
        return util.mkdir(versionDir)
          .then(function () {
            logger.debug('[%s] Directory created: %s', version, versionDir)
          })
          .then(function () {
            return util.exec(`git clone . ${versionDir}`)
          })
          .then(execLog)
      }
    )
    .then(function () {
      const command = `source ${process.env.NVM_DIR}/nvm.sh && nvm use ${version} && npm prune && npm install && npm test`
      return util.exec(command, {shell: '/bin/bash', cwd: versionDir})
        .then(execLog)
    })
    .then(function () {
      logger.info('[%s] Test case execution success', version)
      return Promise.resolve({version, returnCode: 0})
    })
    .catch(function ({message, code = 1}) {
      logger.error('[%s] %s', version, message)
      return Promise.resolve({version, returnCode: code})
    })
}
