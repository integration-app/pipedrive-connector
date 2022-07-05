import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from './common'

export const pipelines = objectCollectionHandler({
  name: 'Pipelines',
  path: 'pipelines',
  fieldsSchema: null,
})

export const PIPELINE_SCHEMA = Type.Integer({
  title: 'Pipeline',
  referenceCollectionUri: pipelines.path,
})

export const stages = objectCollectionHandler({
  name: 'Stages',
  path: 'stages',
  fieldsSchema: null,
})

export const STAGES_SCHEMA = Type.Integer({
  title: 'Stage',
  referenceCollectionUri: stages.path,
})

export const activityTypes = objectCollectionHandler({
  name: 'Activity Types',
  path: 'activityTypes',
  fieldsSchema: null,
})

export const ACTIVITY_TYPE_SCHEMA = Type.Integer({
  title: 'Type',
  referenceCollectionUri: activityTypes.path,
})

export const leadLabels = objectCollectionHandler({
  name: 'Lead Labels',
  path: 'leadLabels',
  fieldsSchema: null,
})

export const LEAD_LABEL_SCHEMA = Type.Integer({
  title: 'Label',
  referenceCollectionUri: leadLabels.path,
})
