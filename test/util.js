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

describe('exec', function () {
  it('rejects if childProcess.exec fails', function () {
    const exec = sinon.stub().yields('some error')
    const stubs = {
      child_process: {
        exec
      }
    }
    const util = requireInject('../lib/util', stubs)
    return expect(util.exec()).to.be.eventually.rejectedWith('some error')
  })
})
