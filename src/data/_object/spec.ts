import { DataCollectionSpecArgs } from '@integration-app/connector-sdk'
import { DataCollectionSpec } from '@integration-app/sdk'
import { getCustomFields, getCustomFieldSchema } from '../../api/custom-fields'
import { getFilterById } from '../../api/filters'

export default async function spec(
  args: DataCollectionSpecArgs,
): Promise<DataCollectionSpec> {
  const { spec, apiClient, parameters } = args

  const filter = parameters?.filter_id
    ? await getFilterById(apiClient, parameters.filter_id)
    : null
  if (filter) {
    spec.name = filter.name
  }

  const editableCustomFieldKeys = []
  if (parameters.customFieldsPath !== null) {
    const customFields = await getCustomFields(
      parameters.customFieldsPath,
      apiClient,
    )
    for (const customField of customFields) {
      if (!(customField.key in spec.fieldsSchema.properties)) {
        spec.fieldsSchema.properties[customField.key] = {
          title: customField.name,
          ...getCustomFieldSchema(customField),
        }
        if (customField.edit_flag) {
          editableCustomFieldKeys.push(customField.key)
        }
      }
    }
  }

  if (editableCustomFieldKeys.length > 0) {
    spec.update = {
      ...(spec.update ?? {}),
      fields: [...(spec?.update?.fields ?? []), ...editableCustomFieldKeys],
    }
    spec.create = {
      ...(spec?.create ?? {}),
      fields: [...(spec?.create?.fields ?? []), ...editableCustomFieldKeys],
    }
  }

  return spec
}
