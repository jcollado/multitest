import path from 'path'

import {logger} from '../logging'
import {exec, exists, mkdir} from '../util'

export default function runTests (outputDir, version) {
  const versionDir = path.join(outputDir, String(version))

  function execLog (subprocess) {
    logger.debug('[%s] command: %s', version, subprocess.command)
    logger.debug('[%s] stdout:\n%s', version, subprocess.stdout)
    logger.debug('[%s] stderr:\n%s', version, subprocess.stderr)
    return subprocess
  }

  return exists(versionDir)
    .then(
      function () {
        return exec('git rev-parse --abbrev-ref HEAD')
          .then(execLog)
          .then(function (subprocess) {
            const branchName = subprocess.stdout.trimRight()
            return exec(`git fetch && git checkout --force ${branchName} && git reset --hard origin/${branchName} && git pull`, {shell: '/bin/bash', cwd: versionDir})
          })
          .then(execLog)
      },
      function () {
        return mkdir(versionDir)
          .then(function () {
            logger.debug('[%s] Directory created: %s', version, versionDir)
          })
          .then(function () {
            return exec(`git clone . ${versionDir}`)
          })
          .then(execLog)
      }
    )
    .then(function () {
      const command = `source ${process.env.NVM_DIR}/nvm.sh && nvm use ${version} && npm prune && npm install && npm test`
      return exec(command, {shell: '/bin/bash', cwd: versionDir})
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
