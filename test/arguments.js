import test from 'ava'

import {parseArguments} from '../src/arguments'

const defaults = {
  version: 'some version',
  description: 'some description',
  logLevel: 'some log level'
}

test('parseArguments uses defaults', t => {
  const program = parseArguments(defaults, [])
  t.is(program.version(), defaults.version)
  t.is(program.description(), defaults.description)
  t.is(program.logLevel, defaults.logLevel)
})

test('parseArguments parses arguments as expected', t => {
  const expected = {
    logLevel: 'debug'
  }
  const program = parseArguments(
    defaults, ['<node binary>', '<script>',
      '-l', expected.logLevel
    ])

  t.is(program.logLevel, expected.logLevel)
})
