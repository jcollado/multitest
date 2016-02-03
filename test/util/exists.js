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

test('rejects if fs.exists returns false', t => {
  const {exists, util} = t.context
  exists.yields(false)
  return expect(util.exists('path')).to.be.eventually.rejected
})

test('resolves if fs.exists returns true', t => {
  const {exists, util} = t.context
  exists.yields(true)
  return expect(util.exists('path')).to.be.eventually.fulfilled
})
