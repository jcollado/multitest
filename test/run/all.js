import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import requireInject from 'require-inject'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import 'sinon-as-promised'
import test from 'ava'

chai.use(chaiAsPromised)
chai.use(sinonChai)

import pkg from '../../package'

const expect = chai.expect

const outputDir = '.' + pkg.name
const versions = [4, 5]

test.beforeEach(t => {
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
  const stubs = {}
  stubs[require.resolve('../../src/logging')] = {logger}
  stubs[require.resolve('../../src/run/one')] = one
  stubs[require.resolve('../../src/util')] = util
  const runAllTests = requireInject('../../src/run/all', stubs).default
  t.context = {logger, one, runAllTests, util}
})

test('runAllTests makes directory if it does not exist', t => {
  const {logger, runAllTests, util} = t.context
  util.exists.rejects()
  util.mkdir.resolves()

  return expect(runAllTests([])).to.eventually.be.fulfilled
    .then(function () {
      expect(util.mkdir).to.have.been.calledWith(outputDir)
      expect(logger.debug).to.have.been.calledWith(
        'Directory created: %s', outputDir)
    })
})

test('runAllTests runs tests for each version', t => {
  const {one, runAllTests, util} = t.context
  util.exists.resolves()
  one.resolves({version: 'some version', returnCode: 0})

  return expect(runAllTests(versions)).to.eventually.be.fulfilled
  .then(function () {
    versions.forEach(function (version) {
      expect(one).to.have.been.calledWith(outputDir, version)
    })
  })
})

test('runAllTests resolves to 0 on test execution success', t => {
  const {one, runAllTests, util} = t.context
  util.exists.resolves()
  one.resolves({version: 'some version', returnCode: 0})

  return expect(runAllTests(versions)).to.eventually.equal(0)
})

test('runAllTests resolves to 1 on test execution failure', t => {
  const {logger, one, runAllTests, util} = t.context
  util.exists.resolves()
  one
    .onFirstCall().resolves({version: 'some version', returnCode: 1})
    .onSecondCall().resolves({version: 'another version', returnCode: 1})

  return expect(runAllTests(versions)).to.eventually.be.fulfilled
    .then(function (returnCode) {
      expect(returnCode).to.equal(1)
      expect(logger.error).to.have.been.calledWith(
        'Test execution failed for: %s', ['some version', 'another version'])
    })
})
