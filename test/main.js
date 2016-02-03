import requireInject from 'require-inject'
import sinon from 'sinon'
import 'sinon-as-promised'
import test from 'ava'

import pkg from '../package'

test.beforeEach(t => {
  const logger = {
    info: sinon.spy()
  }
  const parseArguments = sinon.stub().returns({logLevel: 'info'})
  const travis = sinon.stub()
  const run = sinon.stub()
  const stubs = {}
  stubs[require.resolve('../src/arguments')] = {parseArguments}
  stubs[require.resolve('../src/logging')] = {logger}
  stubs[require.resolve('../src/run/all')] = run
  stubs[require.resolve('../src/travis')] = travis

  const main = requireInject('../src/main', stubs).default
  t.context = {logger, main, run, travis}
})

test('main logs program version information', t => {
  const {logger, main, run, travis} = t.context
  travis.resolves()
  run.resolves(0)

  return main().then(function () {
    t.true(logger.info.calledWith('%s v%s', pkg.name, pkg.version))
  })
})

test('main resolves to test results on success', t => {
  const {main, run, travis} = t.context
  travis.resolves()
  const expected = 42
  run.resolves(expected)

  return main().then(returnCode => t.is(returnCode, expected))
})

test('main resolves to 1 on travis parsing error', t => {
  const {main, travis} = t.context
  travis.rejects()

  return main().then(returnCode => t.is(returnCode, 1))
})
