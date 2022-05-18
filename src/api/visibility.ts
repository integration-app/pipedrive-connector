import { Type } from '@sinclair/typebox'

export async function makeVisibleToSchema() {
  return Type.Integer({
    title: 'Visible To',
    referenceRecords: [
      // ToDo: this depends on the user's plan - need to check and provide values correspondingly
      // https://developers.pipedrive.com/docs/api/v1/Persons#addPerson
      { id: 1, name: 'Owner & followers' },
      { id: 3, name: 'Entire company' },
    ],
  })
}
