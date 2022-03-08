import { Type } from '@sinclair/typebox'

export async function makeVisibleToSchema() {
  return Type.Integer({
    title: 'Visible To',
    enum: [
      // ToDo: this depends on the user's plan - need to check and provide values correspondingly
      // https://developers.pipedrive.com/docs/api/v1/Persons#addPerson
      { value: 1, label: 'Owner & followers' },
      { value: 3, label: 'Entire company' },
    ],
  })
}
