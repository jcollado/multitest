/* global describe it */
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
  it('rejects if file is not found', function () {
    const stubs = {
      path: {
        join: sinon.stub().returns('<travis-file>')
      }
    }
    const logger = {
      error: sinon.spy()
    }
    stubs[require.resolve('../lib/logging')] = {logger}
    stubs[require.resolve('../lib/util')] = {
      exists: sinon.stub().rejects()
    }
    const parse = requireInject('../lib/travis', stubs)
    return expect(parse()).to.be.eventually.rejected.then(function () {
      expect(logger.error).to.have.been.calledWith(
        'Travis file not found: %s', '<travis-file>')
    })
  })
})
