import {logger} from '../logging'
import one from './one'
import pkg from '../../package'
import {exists, mkdir} from '../util'

export default function runAllTests (versions) {
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
