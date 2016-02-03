import {logger} from './logging'
import {parseArguments} from './arguments'
import pkg from '../package'
import run from './run/all'
import travis from './travis'

export default function main () {
  const defaults = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    logLevel: 'info'
  }
  const program = parseArguments(defaults, process.argv)
  logger.level = program.logLevel

  logger.info('%s v%s', pkg.name, pkg.version)

  return travis()
    .then(run, function () {
      return Promise.resolve(1)
    })
}
