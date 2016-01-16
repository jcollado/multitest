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
  const defaultCommandOutput = {
    command: 'command',
    stdout: 'stdout',
    stderr: 'stderr'
  }
  process.env.NVM_DIR = '<nvm>'

  beforeEach(function () {
    logger = {
      debug: sinon.spy(),
      info: sinon.spy(),
      error: sinon.spy()
    }
    util = {
      exists: sinon.stub(),
      exec: sinon.stub(),
      mkdir: sinon.stub()
    }
    stubs = {}
    stubs[require.resolve('../../lib/logging')] = {logger}
    stubs[require.resolve('../../lib/util')] = util
  })

  it('pulls changes if version directory exists', function () {
    util.exists.resolves()
    util.exec.resolves(defaultCommandOutput)
    const runTests = requireInject('../../lib/run/one', stubs)

    return expect(runTests('some dir', 'some version'))
      .to.eventually.be.fulfilled.then(function () {
        expect(util.exec).to.have.been.calledWith(
          'git pull', {cwd: 'some dir/some version'})
      })
  })

  it('makes directory and clones if version directory does not exist', function () {
    util.exists.rejects()
    util.mkdir.resolves()
    util.exec.resolves(defaultCommandOutput)
    const runTests = requireInject('../../lib/run/one', stubs)

    return expect(runTests('some dir', 'some version'))
      .to.eventually.be.fulfilled.then(function () {
        expect(util.mkdir).to.have.been.calledWith('some dir/some version')
        expect(util.exec).to.have.been.calledWith(
          'git clone . some dir/some version')
      })
  })

  it('runs test cases', function () {
    util.exists.resolves()
    util.exec.resolves(defaultCommandOutput)
    const runTests = requireInject('../../lib/run/one', stubs)

    return expect(runTests('some dir', 'some version'))
      .to.eventually.be.fulfilled.then(function () {
        expect(util.exec).to.have.been.calledWith(
        'source <nvm>/nvm.sh && nvm use some version && npm install && npm test',
        {cwd: 'some dir/some version', shell: '/bin/bash'})
      })
  })

  it('returns 0 on success', function () {
    util.exists.resolves()
    util.exec.resolves(defaultCommandOutput)
    const runTests = requireInject('../../lib/run/one', stubs)

    return expect(runTests('some dir', 'some version'))
      .to.eventually.deep.equal({
        version: 'some version',
        returnCode: 0
      }).then(function () {
        expect(logger.info).to.have.been.calledWith(
          '[%s] Test case execution success', 'some version')
      })
  })

  it('returns err.code on failure', function () {
    util.exists.resolves()
    util.exec
      .onFirstCall().resolves(defaultCommandOutput)
      .onSecondCall().rejects({message: 'some error', code: 42})
    const runTests = requireInject('../../lib/run/one', stubs)

    return expect(runTests('some dir', 'some version'))
      .to.eventually.deep.equal({
        version: 'some version',
        returnCode: 42
      }).then(function () {
        expect(logger.error).to.have.been.calledWith(
          '[%s] %s', 'some version', 'some error')
      })
  })

  it('return 1 if err.code is missing on failure', function () {
    util.exists.rejects()
    util.mkdir.rejects(new Error('some error'))
    const runTests = requireInject('../../lib/run/one', stubs)

    return expect(runTests('some dir', 'some version'))
      .to.be.eventually.fulfilled.then(function (result) {
        expect(result).to.deep.equal({
          version: 'some version',
          returnCode: 1
        })
        expect(logger.error).to.have.been.calledWith(
          '[%s] %s', 'some version', 'some error')
      })
  })
})
