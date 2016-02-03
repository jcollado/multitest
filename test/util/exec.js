import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import requireInject from 'require-inject'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import test from 'ava'

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

test.beforeEach(t => {
  const exec = sinon.stub()
  const stubs = {
    child_process: {
      exec
    }
  }
  const util = requireInject('../../src/util', stubs)
  t.context = {exec, util}
})

test('exec rejects if childProcess.exec fails', t => {
  const {exec, util} = t.context
  exec.yields('some error')
  return expect(util.exec('command'))
    .to.be.eventually.rejectedWith('some error')
})

test('exec resolves if childProcess.exec succeeds', t => {
  const {exec, util} = t.context
  exec.yields(null, 'stdout', 'stderr')
  return expect(util.exec('command')).to.eventually.deep.equal({
    command: 'command',
    stdout: 'stdout',
    stderr: 'stderr'
  })
})

