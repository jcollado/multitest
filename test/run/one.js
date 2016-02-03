import 'babel-register'
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
  const stubs = {}
  stubs[require.resolve('../../src/logging')] = {logger}
  stubs[require.resolve('../../src/util')] = util
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
  util.exec.onSecondCall().resolves(defaultCommandOutput)

  return expect(runTests('some dir', 'some version'))
    .to.eventually.be.fulfilled.then(function () {
      expect(util.exec).to.have.been.calledWith(
        'git fetch && git checkout --force <branch> && git reset --hard origin/<branch> && git pull', {shell: '/bin/bash', cwd: 'some dir/some version'})
    })
})

test('makes directory and clones if version directory does not exist', t => {
  const {runTests, util} = t.context
  util.exists.rejects()
  util.mkdir.resolves()
  util.exec.resolves(defaultCommandOutput)

  return expect(runTests('some dir', 'some version'))
    .to.eventually.be.fulfilled.then(function () {
      expect(util.mkdir).to.have.been.calledWith('some dir/some version')
      expect(util.exec).to.have.been.calledWith(
        'git clone . some dir/some version')
    })
})

test('runs test cases', t => {
  const {runTests, util} = t.context
  util.exists.resolves()
  util.exec.resolves(defaultCommandOutput)

  return expect(runTests('some dir', 'some version'))
    .to.eventually.be.fulfilled.then(function () {
      expect(util.exec).to.have.been.calledWith(
      'source <nvm>/nvm.sh && nvm use some version && npm prune && npm install && npm test',
      {cwd: 'some dir/some version', shell: '/bin/bash'})
    })
})

test('returns 0 on success', t => {
  const {logger, runTests, util} = t.context
  util.exists.resolves()
  util.exec.resolves(defaultCommandOutput)

  return expect(runTests('some dir', 'some version'))
    .to.eventually.deep.equal({
      version: 'some version',
      returnCode: 0
    }).then(function () {
      expect(logger.info).to.have.been.calledWith(
        '[%s] Test case execution success', 'some version')
    })
})

test.only('returns err.code on failure', t => {
  const {logger, runTests, util} = t.context
  util.exists.resolves()
  util.exec
    .onFirstCall().rejects({message: 'some error', code: 42})

  return expect(runTests('some dir', 'some version'))
    .to.eventually.deep.equal({
      version: 'some version',
      returnCode: 42
    }).then(function () {
      expect(logger.error).to.have.been.calledWith(
        '[%s] %s', 'some version', 'some error')
    })
})

test('return 1 if err.code is missing on failure', t => {
  const {logger, runTests, util} = t.context
  util.exists.rejects()
  util.mkdir.rejects(new Error('some error'))

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
