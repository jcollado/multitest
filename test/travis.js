import path from 'path'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import requireInject from 'require-inject'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import 'sinon-as-promised'
import test from 'ava'

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

test.beforeEach(t => {
  const stubs = {
    path: {
      basename: path.basename,
      extname: path.extname,
      join: sinon.stub().returns('<travis-file>')
    }
  }
  const logger = {
    info: sinon.spy(),
    error: sinon.spy()
  }
  stubs[require.resolve('../src/logging')] = {logger}

  const util = {}
  stubs[require.resolve('../src/util')] = util

  const parse = requireInject('../src/travis', stubs).default
  t.context = {logger, parse, util}
})

test('travis rejects if file is not found', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().rejects()

  return expect(parse()).to.be.eventually.rejected.then(function () {
    expect(logger.error).to.have.been.calledWith(
      'Travis file not found: %s', '<travis-file>')
  })
})

test('travis rejects if language field is not found', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves('value: 42')

  return expect(parse()).to.be.eventually.rejected.then(function () {
    expect(logger.error).to.have.been.calledWith(
      'language field not found in travis configuration')
  })
})

test('travis rejects if language field is not node_js', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves('language: some-other-language')

  return expect(parse()).to.be.eventually.rejected.then(function () {
    expect(logger.error).to.have.been.calledWith(
      'Unexpected language in travis configuration: %s',
      'some-other-language'
    )
  })
})

test('travis rejects if node_js field is not found', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves('language: node_js')

  return expect(parse()).to.be.eventually.rejected.then(function () {
    expect(logger.error).to.have.been.calledWith(
      'node_js field not found in travis configuration')
  })
})

test('travis resolves to versions found', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves(
    'language: node_js\n' +
    'node_js:\n' +
    '- 4\n' +
    '- 5')

  return expect(parse()).to.eventually.deep.equal([4, 5]).then(function () {
    expect(logger.info).to.have.been.calledWith(
      'Node versions to use for testing: %s', [4, 5])
  })
})
