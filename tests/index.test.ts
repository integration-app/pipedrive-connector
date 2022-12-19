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
        'update_time',
      ],
    },
    '/data/persons': {
      skipFields: ['marketing_status', 'update_time'],
    },
    '/data/activities': {
      skipFields: ['due_time', 'duration', 'update_time'], // Due time and duration are being converted to HH:MM (from HH:MM:ss) and it gets mismatched
    },
    '/data/products': {
      skipFields: ['prices', 'update_time'],
      skipQueryFields: ['code'],
      genFieldValues: {
        name: () => 'TestProduct' + Math.random().toString(36).substring(7),
        owner_id: () => 13497943,
        visible_to: () => 3,
        code: () => 'ProductCode',
        active_flag: () => true,
        selectable: () => true,
      },
    },
  },
})

runner.runTests(async () => {
  await runner.data.testAll()
})
