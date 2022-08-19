import * as dotenv from 'dotenv'

dotenv.config()

import { TestRunner } from '@integration-app/connector-sdk'

const runner = new TestRunner({
  baseUri: process.env.BASE_URI,
  accessToken: process.env.TEST_ACCESS_TOKEN,
  skipFields: {
    '/data/deals': [
      'probability', // If we try to set probability in some pipelines, it will raise an error 'Deal probability is not enabled on this pipeline.'
    ],
  },
  queryDelay: 5000,
})

runner.runTests(async () => {
  await runner.data.testAll()
})
