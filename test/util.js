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
