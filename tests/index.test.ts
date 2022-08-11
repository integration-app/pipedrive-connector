import * as dotenv from 'dotenv'

dotenv.config()

import { TestRunner } from '@integration-app/connector-sdk'

const runner = new TestRunner({
  baseUri: process.env.BASE_URI,
  accessToken: process.env.TEST_ACCESS_TOKEN,
})

runner.runTests(async () => {
  await runner.data.testAll()
})
