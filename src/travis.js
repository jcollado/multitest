import path from 'path'

import yaml from 'js-yaml'

import {logger} from './logging'
import util from './util'

export default function parse () {
  const travisFile = path.join(process.cwd(), '.travis.yml')
  return util.exists(travisFile)
    .catch(function () {
      logger.error('Travis file not found: %s', travisFile)
      return Promise.reject()
    })
    .then(function () {
      return util.readFile(travisFile)
    })
    .then(function (data) {
      const travisConfig = yaml.safeLoad(data)
      if (typeof travisConfig.language === 'undefined') {
        logger.error('language field not found in travis configuration')
        return Promise.reject()
      }
      if (travisConfig.language !== 'node_js') {
        logger.error(
          'Unexpected language in travis configuration: %s',
          travisConfig.language)
        return Promise.reject()
      }

      if (typeof travisConfig.node_js === 'undefined') {
        logger.error('node_js field not found in travis configuration')
        return Promise.reject()
      }

      logger.info('Node versions to use for testing: %s', travisConfig.node_js)
      return Promise.resolve(travisConfig.node_js)
    })
}
