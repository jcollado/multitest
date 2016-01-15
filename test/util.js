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

describe('exec', function () {
  let exec
  let stubs

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
    const util = requireInject('../lib/util', stubs)
    return expect(util.exec('command'))
      .to.be.eventually.rejectedWith('some error')
  })

  it('resolves if childProcess.exec succeeds', function () {
    exec.yields(null, 'stdout', 'stderr')
    const util = requireInject('../lib/util', stubs)
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

  beforeEach(function () {
    exists = sinon.stub()
    stubs = {
      fs: {
        exists
      }
    }
  })

  it('rejects if fs.exists returns false', function () {
    exists.yields(false)
    const util = requireInject('../lib/util', stubs)
    return expect(util.exists('path')).to.be.eventually.rejected
  })

  it('resolves if fs.exists returns true', function () {
    exists.yields(true)
    const util = requireInject('../lib/util', stubs)
    return expect(util.exists('path')).to.be.eventually.fulfilled
  })
})

describe('promisify', function () {
  it('calls wrapped function with arguments', function () {
    const util = require('../lib/util')
    const fn = sinon.stub().yields()
    const promisified = util.promisify(fn)
    return expect(promisified('some', 'arguments'))
      .to.be.eventually.fulfilled.then(function () {
        expect(fn).to.have.been.calledWith('some', 'arguments')
      })
  })

  it('rejects when wrapped function returns error', function () {
    const util = require('../lib/util')
    const fn = sinon.stub().yields('some error')
    const promisified = util.promisify(fn)
    return expect(promisified('some', 'arguments'))
      .to.be.eventually.rejectedWith('some error')
  })

  it('resolves when wrapped function returns no error', function () {
    const util = require('../lib/util')
    const fn = sinon.stub().yields(null, 'a', 'result')
    const promisified = util.promisify(fn)
    return expect(promisified('some', 'arguments'))
      .to.eventually.deep.equal(['a', 'result'])
  })
})
