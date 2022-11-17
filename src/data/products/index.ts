import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = [
  'deal_id',
  'product_id',
  'item_price',
  'quantity',
  'discount_percentage',
  'duration',
  'product_variation_id',
  'comments',
  'tax',
  'enabled_flag',
]

const deals = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'products',
  name: 'Products',
  customFieldsPath: 'productFields',
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['deal_id', 'item_price', 'product_id', 'quantity'],
  updateFields: [
    'item_price',
    'quantity',
    'discount_percentage',
    'duration',
    'product_variation_id',
    'comments',
    'tax',
    'enabled_flag',
  ],
  queryFields: ['code', 'name'],
  eventObject: 'product',
})

export default deals
