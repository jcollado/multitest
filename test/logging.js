/* global describe it */
import chai from 'chai'
const expect = chai.expect

import {logger} from '../src/logging'

describe('logger', function () {
  it('writes to console', function () {
    expect(logger).to.have.deep.property('transports.console')
  })
})
