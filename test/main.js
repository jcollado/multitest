/* global describe it beforeEach */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import requireInject from 'require-inject'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
require('sinon-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

import pkg from '../package'

const expect = chai.expect

describe('main', function () {
  let logger
  let parseArguments
  let travis
  let run
  let stubs

  function requireModule () {
    return requireInject('../src/main', stubs).default
  }

  beforeEach(function () {
    logger = {
      info: sinon.spy()
    }
    parseArguments = sinon.stub().returns({logLevel: 'info'})
    travis = sinon.stub()
    run = sinon.stub()
    stubs = {}
    stubs[require.resolve('../src/arguments')] = {parseArguments}
    stubs[require.resolve('../src/logging')] = {logger}
    stubs[require.resolve('../src/run/all')] = run
    stubs[require.resolve('../src/travis')] = travis
  })

  it('logs program version information', function () {
    travis.resolves()
    run.resolves(0)
    const main = requireModule()

    return expect(main()).to.be.eventually.fulfilled
      .then(function () {
        expect(logger.info).to.have.been.calledWith(
          '%s v%s', pkg.name, pkg.version)
      })
  })

  it('resolves to test results on success', function () {
    travis.resolves()
    const returnCode = 42
    run.resolves(returnCode)
    const main = requireModule()

    return expect(main()).to.eventually.equal(returnCode)
  })

  it('resolves to 1 on travis parsing error', function () {
    travis.rejects()
    const main = requireModule()

    return expect(main()).to.eventually.equal(1)
  })
})
