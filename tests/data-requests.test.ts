import { makeRequest } from './config'

describe('Data Requests', () => {
  it('should return persons collection', async () => {
    const rootDataResponse = await makeRequest('/data/collections/persons')

    expect(rootDataResponse.body).toHaveProperty('create')
  })
})
