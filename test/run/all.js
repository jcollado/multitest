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
  let util
  let stubs

  function requireModule () {
    return requireInject('../../lib/run/all', stubs)
  }

  beforeEach(function () {
    logger = {
      debug: sinon.spy(),
      info: sinon.spy(),
      error: sinon.spy()
    }
    util = {
      exists: sinon.stub(),
      mkdir: sinon.stub()
    }
    stubs = {}
    stubs[require.resolve('../../lib/logging')] = {logger}
    stubs[require.resolve('../../lib/util')] = util
  })

  it('makes directory if it does not exist', function () {
    util.exists.rejects()
    util.mkdir.resolves()
    const runAllTests = requireModule()

    return expect(runAllTests([])).to.eventually.be.fulfilled
      .then(function () {
        expect(util.mkdir).to.have.been.calledWith('.' + pkg.name)
        expect(logger.debug).to.have.been.calledWith(
          'Directory created: %s', '.' + pkg.name)
      })
  })
})

