import requireInject from 'require-inject'
import sinon from 'sinon'
import test from 'ava'

test.beforeEach((t) => {
  const exec = sinon.stub()
  const stubs = {
    child_process: {
      exec
    }
  }
  const util = requireInject('../../src/util', stubs)
  t.context = {exec, util}
})

test('exec rejects if childProcess.exec fails', (t) => {
  const {exec, util} = t.context
  exec.yields('some error')
  return t.throws(util.exec('command'), 'some error')
})

test('exec resolves if childProcess.exec succeeds', (t) => {
  const {exec, util} = t.context
  exec.yields(null, 'stdout', 'stderr')
  return util.exec('command').then((result) => {
    t.same(result, {
      command: 'command',
      stdout: 'stdout',
      stderr: 'stderr'
    })
  })
})
