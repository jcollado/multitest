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

describe('runTests', function () {
  let logger
  let util
  let stubs

  beforeEach(function () {
    logger = {
      debug: sinon.spy(),
      info: sinon.spy()
    }
    util = {
      exists: sinon.stub(),
      exec: sinon.stub()
    }
    stubs = {}
    stubs[require.resolve('../lib/logging')] = {logger}
    stubs[require.resolve('../lib/util')] = util
  })

  it('pulls changes if version directory exists', function () {
    util.exists.resolves()
    util.exec.resolves()
    const runTests = requireInject('../lib/run', stubs).runTests

    return expect(runTests('some dir', 'some version'))
      .to.eventually.be.fulfilled.then(function () {
        expect(util.exec).to.have.been.calledWith(
          'git pull', {cwd: 'some dir/some version'})
      })
  })
})
