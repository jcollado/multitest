import requireInject from 'require-inject'
import sinon from 'sinon'
import 'sinon-as-promised'
import test from 'ava'

import pkg from '../package'

test.beforeEach((t) => {
  const logger = {
    info: sinon.spy()
  }
  const parseArguments = sinon.stub().returns({logLevel: 'info'})
  const travis = sinon.stub()
  const run = sinon.stub()
  const stubs = {
    [require.resolve('../src/arguments')]: {parseArguments},
    [require.resolve('../src/logging')]: {logger},
    [require.resolve('../src/run/all')]: run,
    [require.resolve('../src/travis')]: travis
  }

  const main = requireInject('../src/main', stubs).default
  t.context = {logger, main, run, travis}
})

test('main logs program version information', async function (t) {
  const {logger, main, run, travis} = t.context
  travis.resolves()
  run.resolves(0)

  await main()
  t.true(logger.info.calledWith('%s v%s', pkg.name, pkg.version))
})

test('main resolves to test results on success', async function (t) {
  const {main, run, travis} = t.context
  travis.resolves()
  const expected = 42
  run.resolves(expected)

  const returnCode = await main()
  t.is(returnCode, expected)
})

test('main resolves to 1 on travis parsing error', async function (t) {
  const {main, travis} = t.context
  travis.rejects()

  const returnCode = await main()
  t.is(returnCode, 1)
})
