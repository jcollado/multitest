import 'babel-register'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import requireInject from 'require-inject'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import 'sinon-as-promised'
import test from 'ava'

chai.use(chaiAsPromised)
chai.use(sinonChai)

import pkg from '../package'

const expect = chai.expect

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

  return expect(main()).to.be.eventually.fulfilled
    .then(function () {
      expect(logger.info).to.have.been.calledWith(
        '%s v%s', pkg.name, pkg.version)
    })
})

test('main resolves to test results on success', t => {
  const {main, run, travis} = t.context
  travis.resolves()
  const returnCode = 42
  run.resolves(returnCode)

  return expect(main()).to.eventually.equal(returnCode)
})

test('main resolves to 1 on travis parsing error', t => {
  const {main, travis} = t.context
  travis.rejects()

  return expect(main()).to.eventually.equal(1)
})
