import requireInject from 'require-inject'
import sinon from 'sinon'
import test from 'ava'

test.beforeEach((t) => {
  const exists = sinon.stub()
  const stubs = {
    fs: {
      exists,
      mkdir: sinon.stub(),
      readFile: sinon.stub()
    }
  }
  const util = requireInject('../../src/util', stubs)
  t.context = {exists, util}
})

test('rejects if fs.exists returns false', (t) => {
  const {exists, util} = t.context
  exists.yields(false)
  return t.throws(util.exists('path'))
})

test('resolves if fs.exists returns true', (t) => {
  const {exists, util} = t.context
  exists.yields(true)
  return util.exists('path').catch(() => t.fail())
})
