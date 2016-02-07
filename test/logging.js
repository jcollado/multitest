import test from 'ava'

import {logger} from '../src/logging'

test('logger writes to console', (t) => {
  t.ok(logger.transports.console)
})
