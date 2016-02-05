import requireInject from 'require-inject'
import sinon from 'sinon'
import 'sinon-as-promised'
import test from 'ava'

const defaultCommandOutput = {
  command: 'command',
  stdout: 'stdout',
  stderr: 'stderr'
}
process.env.NVM_DIR = '<nvm>'

test.beforeEach(t => {
  const logger = {
    debug: sinon.spy(),
    info: sinon.spy(),
    error: sinon.spy()
  }
  const util = {
    exists: sinon.stub(),
    exec: sinon.stub(),
    mkdir: sinon.stub()
  }
  const stubs = {
    [require.resolve('../../src/logging')]: {logger},
    [require.resolve('../../src/util')]: util
  }
  const runTests = requireInject('../../src/run/one', stubs).default

  t.context = {logger, runTests, util}
})

test('pulls changes if version directory exists', t => {
  const {runTests, util} = t.context
  util.exists.resolves()
  util.exec.onFirstCall().resolves({
    command: 'command',
    stdout: '<branch>',
    stderr: ''
  })
  util.exec.resolves(defaultCommandOutput)

  return runTests('some dir', 'some version').then(() => {
    t.true(util.exec.calledWith(
      'git fetch && git checkout --force <branch> && git reset --hard origin/<branch> && git pull',
      {shell: '/bin/bash', cwd: 'some dir/some version'}))
  })
})

test('makes directory and clones if version directory does not exist', t => {
  const {runTests, util} = t.context
  util.exists.rejects()
  util.mkdir.resolves()
  util.exec.resolves(defaultCommandOutput)

  return runTests('some dir', 'some version').then(() => {
    t.true(util.mkdir.calledWith('some dir/some version'))
    t.true(util.exec.calledWith('git clone . some dir/some version'))
  })
})

test('runs test cases', t => {
  const {runTests, util} = t.context
  util.exists.resolves()
  util.exec.resolves(defaultCommandOutput)

  return runTests('some dir', 'some version').then(() => {
    t.true(util.exec.calledWith(
      'source <nvm>/nvm.sh && nvm use some version && npm prune && npm install && npm test',
      {cwd: 'some dir/some version', shell: '/bin/bash'}))
  })
})

test('returns 0 on success', t => {
  const {logger, runTests, util} = t.context
  util.exists.resolves()
  util.exec.resolves(defaultCommandOutput)

  return runTests('some dir', 'some version').then(result => {
    t.same(result, {
      version: 'some version',
      returnCode: 0
    })
    t.true(logger.info.calledWith(
      '[%s] Test case execution success', 'some version'))
  })
})

test('returns err.code on failure', t => {
  const {logger, runTests, util} = t.context
  util.exists.resolves()
  util.exec
    .onFirstCall().rejects({message: 'some error', code: 42})

  return runTests('some dir', 'some version').then(result => {
    t.same(result, {
      version: 'some version',
      returnCode: 42
    })
    t.true(logger.error.calledWith(
      '[%s] %s', 'some version', 'some error'))
  })
})

test('return 1 if err.code is missing on failure', t => {
  const {logger, runTests, util} = t.context
  util.exists.rejects()
  util.mkdir.rejects(new Error('some error'))

  return runTests('some dir', 'some version').then(result => {
    t.same(result, {
      version: 'some version',
      returnCode: 1
    })
    t.true(logger.error.calledWith('[%s] %s', 'some version', 'some error'))
  })
})
