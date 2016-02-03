import chai from 'chai'
import test from 'ava'

const expect = chai.expect

import {parseArguments} from '../src/arguments'

const defaults = {
  version: 'some version',
  description: 'some description',
  logLevel: 'some log level'
}

test('parseArguments uses defaults', () => {
  const program = parseArguments(defaults, [])
  expect(program.version()).to.equal(defaults.version)
  expect(program.description()).to.equal(defaults.description)
  expect(program).to.have.property('logLevel', defaults.logLevel)
})

test('parseArguments parses arguments as expected', () => {
  const expected = {
    logLevel: 'debug'
  }
  const program = parseArguments(
    defaults, ['<node binary>', '<script>',
      '-l', expected.logLevel
    ])

  expect(program).to.have.property('logLevel', expected.logLevel)
})
