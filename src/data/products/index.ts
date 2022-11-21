import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = [
  // 'name',
  'code',
  'unit',
  'tax',
  'active_flag',
  'selectable',
  'visible_to',
  'owner_id',
]

const deals = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'products',
  name: 'Products',
  customFieldsPath: 'productFields',
  createFields: [...MODIFIABLE_FIELDS, 'name'],
  requiredFields: ['name'],
  updateFields: MODIFIABLE_FIELDS,
  queryFields: ['name', 'code'],
  eventObject: 'product',
})

export default deals
