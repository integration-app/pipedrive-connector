import * as dotenv from 'dotenv'

dotenv.config()

import { TestRunner } from '@integration-app/connector-sdk'

const runner = new TestRunner({
  baseUri: process.env.BASE_URI,
  accessToken: process.env.TEST_ACCESS_TOKEN,
  skipFields: {
    '/data/deals': [
      'probability', // If we try to set probability in some pipelines, it will raise an error 'Deal probability is not enabled on this pipeline.'
      'lost_reason', // custom lost_reason is not returned in events for some reason - may be a bug on our side.
    ],
    '/data/persons': ['marketing_status'],
    '/data/activities': ['due_time', 'duration'], // Due time and duration are being converted to HH:MM (from HH:MM:ss) and it gets mismatched
  },
  queryDelay: 5000,
  filter: process.argv[2],
  fieldValueGenerators: {
    '/data/products': {
      prices: () => [
        {
          id: 612646,
          product_id: 807027,
          price: 243329,
          currency: 'USD',
          cost: 926549,
          overhead_cost: 154251,
        },
      ],
      visible_to: () => 3,
      code: () => '1',
    },
  },
})

runner.runTests(async () => {
  await runner.data.testAll()
})
