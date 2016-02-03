/* global describe it */
'use strict'

const chai = require('chai')
const expect = chai.expect

const logger = require('../src/logging').logger

describe('logger', function () {
  it('writes to console', function () {
    expect(logger).to.have.deep.property('transports.console')
  })
})
