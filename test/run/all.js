/* global describe it beforeEach */
'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const requireInject = require('require-inject')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
require('sinon-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const pkg = require('../../package')

const expect = chai.expect

describe('runAllTests', function () {
  let logger
  let one
  let util
  let stubs

  const outputDir = '.' + pkg.name
  const versions = [4, 5]

  function requireModule () {
    return requireInject('../../src/run/all', stubs).default
  }

  beforeEach(function () {
    logger = {
      debug: sinon.spy(),
      info: sinon.spy(),
      error: sinon.spy()
    }
    one = sinon.stub()
    util = {
      exists: sinon.stub(),
      mkdir: sinon.stub()
    }
    stubs = {}
    stubs[require.resolve('../../src/logging')] = {logger}
    stubs[require.resolve('../../src/run/one')] = one
    stubs[require.resolve('../../src/util')] = util
  })

  it('makes directory if it does not exist', function () {
    util.exists.rejects()
    util.mkdir.resolves()
    const runAllTests = requireModule()

    return expect(runAllTests([])).to.eventually.be.fulfilled
      .then(function () {
        expect(util.mkdir).to.have.been.calledWith(outputDir)
        expect(logger.debug).to.have.been.calledWith(
          'Directory created: %s', outputDir)
      })
  })

  it('runs tests for each version', function () {
    util.exists.resolves()
    one.resolves({version: 'some version', returnCode: 0})
    const runAllTests = requireModule()

    return expect(runAllTests(versions)).to.eventually.be.fulfilled
    .then(function () {
      versions.forEach(function (version) {
        expect(one).to.have.been.calledWith(outputDir, version)
      })
    })
  })

  it('resolves to 0 on test execution success', function () {
    util.exists.resolves()
    one.resolves({version: 'some version', returnCode: 0})
    const runAllTests = requireModule()

    return expect(runAllTests(versions)).to.eventually.equal(0)
  })

  it('resolves to 1 on test execution failure', function () {
    util.exists.resolves()
    one
      .onFirstCall().resolves({version: 'some version', returnCode: 1})
      .onSecondCall().resolves({version: 'another version', returnCode: 1})
    const runAllTests = requireModule()

    return expect(runAllTests(versions)).to.eventually.be.fulfilled
      .then(function (returnCode) {
        expect(returnCode).to.equal(1)
        expect(logger.error).to.have.been.calledWith(
          'Test execution failed for: %s', ['some version', 'another version'])
      })
  })
})
