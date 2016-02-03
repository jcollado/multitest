import 'babel-register'
import chai from 'chai'
import test from 'ava'

const expect = chai.expect

import {logger} from '../src/logging'

test('logger writes to console', function () {
  expect(logger).to.have.deep.property('transports.console')
})
