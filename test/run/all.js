import requireInject from 'require-inject'
import sinon from 'sinon'
import 'sinon-as-promised'
import test from 'ava'

import pkg from '../../package'

const outputDir = '.' + pkg.name
const versions = [4, 5]

test.beforeEach((t) => {
  const logger = {
    debug: sinon.spy(),
    info: sinon.spy(),
    error: sinon.spy()
  }
  const one = sinon.stub()
  const util = {
    exists: sinon.stub(),
    mkdir: sinon.stub()
  }
  const stubs = {
    [require.resolve('../../src/logging')]: {logger},
    [require.resolve('../../src/run/one')]: one,
    [require.resolve('../../src/util')]: util
  }
  const runAllTests = requireInject('../../src/run/all', stubs).default
  t.context = {logger, one, runAllTests, util}
})

test('runAllTests makes directory if it does not exist', async function (t) {
  const {logger, runAllTests, util} = t.context
  util.exists.rejects()
  util.mkdir.resolves()

  await runAllTests([])
  t.true(util.mkdir.calledWith(outputDir))
  t.true(logger.debug.calledWith('Directory created: %s', outputDir))
})

test('runAllTests runs tests for each version', async function (t) {
  const {one, runAllTests, util} = t.context
  util.exists.resolves()
  one.resolves({version: 'some version', returnCode: 0})

  await runAllTests(versions)
  versions.forEach(function (version) {
    t.true(one.calledWith(outputDir, version))
  })
})

test('runAllTests resolves to 0 on test execution success', async function (t) {
  const {one, runAllTests, util} = t.context
  util.exists.resolves()
  one.resolves({version: 'some version', returnCode: 0})

  const returnCode = await runAllTests(versions)
  t.is(returnCode, 0)
})

test('runAllTests resolves to 1 on test execution failure', async function (t) {
  const {logger, one, runAllTests, util} = t.context
  util.exists.resolves()
  one
    .onFirstCall().resolves({version: 'some version', returnCode: 1})
    .onSecondCall().resolves({version: 'another version', returnCode: 1})

  const returnCode = await runAllTests(versions)
  t.is(returnCode, 1)
  t.true(logger.error.calledWith(
    'Test execution failed for: %s', ['some version', 'another version']))
})
