import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { FormComposer, FormInputType } from '@integration-app/ui'
import NewConnectionPage from '@integration-app/ui/NewConnectionPage'

const schema = [
  {
    type: FormInputType.input,
    id: 'api_token',
    label: 'API Token',
    placeholder: 'Your Pipedrive API Token',
    required: true,
  },
]

ReactDOM.render(
  <NewConnectionPage title='Pipedrive Connection'>
    <FormComposer
      schema={schema}
      onSubmit={function () {
        this.form.submit()
      }}
    />
  </NewConnectionPage>,
  document.getElementById('root'),
)
