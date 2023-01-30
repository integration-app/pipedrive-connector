import { objectCollectionHandler } from '../common'
import { DataCollectionEventType } from '@integration-app/sdk/data-collections'
import { getLatestRecords } from '../../api/subscriptions'
import { PullLatestRecordsSubscriptionHandler } from '@integration-app/connector-sdk'

const MODIFIABLE_FIELDS = [
  'name',
  'owner_id',
  'org_id',
  'email',
  'phone',
  'marketing_status',
]

const persons = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'persons',
  customFieldsPath: 'personFields',
  name: 'Persons',
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  updateFields: MODIFIABLE_FIELDS,
  queryFields: ['email', 'name', 'phone'],
  subscription: {
    [DataCollectionEventType.UPDATED]: new PullLatestRecordsSubscriptionHandler(
      {
        pullLatestRecords: async (args) =>
          getLatestRecords(
            args,
            'persons',
            false,
            DataCollectionEventType.UPDATED,
          ),
      },
    ),
  },
})

export default persons
