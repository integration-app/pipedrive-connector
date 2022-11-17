import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = [
  'name',
  'code',
  'unit',
  'tax',
  'active_flag',
  'selectable',
  'visible_to',
  'owner_id',
  'prices',
]

const deals = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'products',
  name: 'Products',
  customFieldsPath: 'productFields',
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  updateFields: MODIFIABLE_FIELDS,
  queryFields: ['code', 'name'],
  eventObject: 'product',
})

export default deals
