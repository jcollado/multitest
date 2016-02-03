/* global describe it beforeEach */
'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const requireInject = require('require-inject')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

describe('exec', function () {
  let exec
  let stubs

  function requireModule () {
    return requireInject('../src/util', stubs)
  }

  beforeEach(function () {
    exec = sinon.stub()
    stubs = {
      child_process: {
        exec
      }
    }
  })

  it('rejects if childProcess.exec fails', function () {
    exec.yields('some error')
    const util = requireModule()
    return expect(util.exec('command'))
      .to.be.eventually.rejectedWith('some error')
  })

  it('resolves if childProcess.exec succeeds', function () {
    exec.yields(null, 'stdout', 'stderr')
    const util = requireModule()
    return expect(util.exec('command')).to.eventually.deep.equal({
      command: 'command',
      stdout: 'stdout',
      stderr: 'stderr'
    })
  })
})

describe('exists', function () {
  let exists
  let stubs

  function requireModule () {
    return requireInject('../src/util', stubs)
  }

  beforeEach(function () {
    exists = sinon.stub()
    stubs = {
      fs: {
        exists,
        mkdir: sinon.stub(),
        readFile: sinon.stub()
      }
    }
  })

  it('rejects if fs.exists returns false', function () {
    exists.yields(false)
    const util = requireModule()
    return expect(util.exists('path')).to.be.eventually.rejected
  })

  it('resolves if fs.exists returns true', function () {
    exists.yields(true)
    const util = requireModule()
    return expect(util.exists('path')).to.be.eventually.fulfilled
  })
})
