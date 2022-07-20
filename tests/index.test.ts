import {
  unifiedFieldsTest,
  basicFunctionalityTest,
} from '@integration-app/connector-sdk'

describe('Connector Test', () => {
  basicFunctionalityTest()
  unifiedFieldsTest()
})
