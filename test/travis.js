import path from 'path'

import requireInject from 'require-inject'
import sinon from 'sinon'
import 'sinon-as-promised'
import test from 'ava'

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

  return parse().catch(() => {
    t.true(logger.error.calledWith(
      'Travis file not found: %s', '<travis-file>'))
  })
})

test('travis rejects if language field is not found', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves('value: 42')

  return parse().catch(() => {
    t.true(logger.error.calledWith(
      'language field not found in travis configuration'))
  })
})

test('travis rejects if language field is not node_js', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves('language: some-other-language')

  return parse().catch(() => {
    t.true(logger.error.calledWith(
      'Unexpected language in travis configuration: %s',
      'some-other-language'
    ))
  })
})

test('travis rejects if node_js field is not found', t => {
  const {logger, parse, util} = t.context
  util.exists = sinon.stub().resolves()
  util.readFile = sinon.stub().resolves('language: node_js')

  return parse().catch(() => {
    t.true(logger.error.calledWith(
      'node_js field not found in travis configuration'))
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

  return parse().then(versions => {
    t.same(versions, [4, 5])
    t.true(logger.info.calledWith(
      'Node versions to use for testing: %s', [4, 5]))
  })
})
