import { makeRequest } from './config'

describe('Data Requests', () => {
  it('should return persons collection', async () => {
    const response = await makeRequest('/data/persons')

    expect(response.body).toHaveProperty('fieldsSchema')
  })
})
