/* global describe it */
'use strict'

const chai = require('chai')
const expect = chai.expect

describe('parseArguments', function () {
  const parseArguments = require('../src/arguments').parseArguments

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
