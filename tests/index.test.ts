import * as dotenv from 'dotenv'

dotenv.config()

import { TestRunner } from '@integration-app/connector-sdk'

const runner = new TestRunner({
  baseUri: process.env.BASE_URI,
  accessToken: process.env.TEST_ACCESS_TOKEN,
  queryDelay: 5000,
  filter: process.argv[2],
  collections: {
    '/data/deals': {
      skipFields: [
        'probability', // If we try to set probability in some pipelines, it will raise an error 'Deal probability is not enabled on this pipeline.'
        'lost_reason', // custom lost_reason is not returned in events for some reason - may be a bug on our side.
      ],
    },
    '/data/persons': {
      skipFields: ['marketing_status'],
    },
    '/data/activities': {
      skipFields: ['due_time', 'duration'], // Due time and duration are being converted to HH:MM (from HH:MM:ss) and it gets mismatched
    },
    '/data/products': {
      genFieldValues: {
        visible_to: () => 3,
        code: () => '7',
      },
    },
  },
})

runner.runTests(async () => {
  await runner.data.testAll()
})
