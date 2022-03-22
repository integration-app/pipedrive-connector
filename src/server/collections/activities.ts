import { Type } from '@sinclair/typebox'
import { makeActivityTypeSchema } from '../api/activity-types'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeOwnerSchema } from '../api/users'
import { UnifiedActivityFields } from '@integration-app/sdk/udm/crm-activities'
import { DataCollectionHandler } from '@integration-app/connector-sdk'
import {
  findInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'

const RECORD_KEY = 'activities'

const handler: DataCollectionHandler = {
  name: 'Activities',
  find: {
    querySchema: getFindQuerySchema,
    execute: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        ...request,
      }),
    extractUnifiedFields: {
      'crm-activities': extractUnifiedFields,
    },
  },
  create: {
    execute: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-activities': parseUnifiedFields,
    },
  },
  update: {
    execute: async (request) =>
      updateCollectionRecord({
        recordKey: RECORD_KEY,
        ...request,
      }),
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-activities': parseUnifiedFields,
    },
  },
}

export default handler

export async function getFindQuerySchema({ credentials }) {
  return Type.Union([
    await makeSavedFilterQuerySchema(credentials, 'activity'),
    Type.Object(await makeOwnerSchema(credentials)),
  ])
}

export async function getFieldsSchema({ credentials }) {
  return Type.Partial(
    Type.Object({
      type: await makeActivityTypeSchema(credentials),
      subject: Type.String(),
      note: Type.String(),
      public_description: Type.String(),
      done: Type.Boolean(),
      due_date: Type.String({
        format: 'date',
      }),
      due_time: Type.String({
        format: 'time',
      }),
      duration: Type.String({
        format: 'time',
      }),
      location: Type.String(),
      user_id: await makeOwnerSchema(credentials),
      person_id: Type.Integer({
        lookupCollectionUri: 'data/collections/persons',
      }),
      org_id: Type.Integer({
        lookupCollectionUri: 'data/collections/organizations',
      }),
      deal_id: Type.Integer({
        lookupCollectionUri: 'data/collections/deals',
      }),
      lead_id: Type.Integer({
        lookupCollectionUri: 'data/collections/leads',
      }),
    }),
  )
}

function extractUnifiedFields({ fields }): UnifiedActivityFields {
  return {
    title: fields.subject,
    description: fields.note,
    dealId: fields.deal_id,
    leadId: fields.lead_id,
    contactId: fields.person_id,
    companyId: fields.org_id,
  }
}

async function parseUnifiedFields({ udmKey, unifiedFields }) {
  if (udmKey === 'crm-activities') {
    const unifiedActivity = unifiedFields as UnifiedActivityFields
    return {
      fields: {
        subject: unifiedActivity.title,
        note: unifiedActivity.description,
        deal_id: unifiedActivity.dealId,
        lead_id: unifiedActivity.leadId,
        person_id: unifiedActivity.contactId,
        org_id: unifiedActivity.companyId,
        // ToDo: other fields
      },
    }
  } else {
    return null
  }
}
