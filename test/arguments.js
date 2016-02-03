/* global describe it */
import chai from 'chai'
const expect = chai.expect

import {parseArguments} from '../src/arguments'

describe('parseArguments', function () {
  const defaults = {
    version: 'some version',
    description: 'some description',
    logLevel: 'some log level'
  }

  it('uses defaults', function () {
    const program = parseArguments(defaults, [])
    expect(program.version()).to.equal(defaults.version)
    expect(program.description()).to.equal(defaults.description)
    expect(program).to.have.property('logLevel', defaults.logLevel)
  })

  it('parses arguments as expected', function () {
    const expected = {
      logLevel: 'debug'
    }
    const program = parseArguments(
      defaults, ['<node binary>', '<script>',
        '-l', expected.logLevel
      ])

    expect(program).to.have.property('logLevel', expected.logLevel)
  })
})
