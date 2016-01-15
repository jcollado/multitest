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

const expect = chai.expect

describe('travis.parse', function () {
  let stubs
  let logger
  let util

  beforeEach(function () {
    stubs = {
      path: {
        join: sinon.stub().returns('<travis-file>')
      }
    }
    logger = {
      error: sinon.spy()
    }
    stubs[require.resolve('../lib/logging')] = {logger}

    util = {}
    stubs[require.resolve('../lib/util')] = util
  })

  it('rejects if file is not found', function () {
    util.exists = sinon.stub().rejects()

    const parse = requireInject('../lib/travis', stubs)
    return expect(parse()).to.be.eventually.rejected.then(function () {
      expect(logger.error).to.have.been.calledWith(
        'Travis file not found: %s', '<travis-file>')
    })
  })

  it('rejects if language field is not found', function () {
    util.exists = sinon.stub().resolves()
    util.readFile = sinon.stub().resolves('value: 42')

    const parse = requireInject('../lib/travis', stubs)
    return expect(parse()).to.be.eventually.rejected.then(function () {
      expect(logger.error).to.have.been.calledWith(
        'language field not found in travis configuration')
    })
  })

  it('rejects if language field is not node_js', function () {
    util.exists = sinon.stub().resolves()
    util.readFile = sinon.stub().resolves('language: some-other-language')

    const parse = requireInject('../lib/travis', stubs)
    return expect(parse()).to.be.eventually.rejected.then(function () {
      expect(logger.error).to.have.been.calledWith(
        'Unexpected language in travis configuration: %s',
        'some-other-language'
      )
    })
  })

  it('rejects if node_js field is not found', function () {
    util.exists = sinon.stub().resolves()
    util.readFile = sinon.stub().resolves('language: node_js')

    const parse = requireInject('../lib/travis', stubs)
    return expect(parse()).to.be.eventually.rejected.then(function () {
      expect(logger.error).to.have.been.calledWith(
        'node_js field not found in travis configuration')
    })
  })
})
