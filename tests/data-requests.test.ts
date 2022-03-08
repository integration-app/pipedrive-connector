import { makeRequest } from './config'

describe('Data Requests', () => {
  it('should return dataRequest in the root request response', async () => {
    const rootResponse = await makeRequest('')

    expect(rootResponse.body).toHaveProperty('dataRequest')

    const rootDataResponse = await makeRequest(
      rootResponse.body.dataRequest.key,
      rootResponse.body.dataRequest.payload,
    )

    expect(rootDataResponse.body).toHaveProperty('links')
    const links = rootDataResponse.body.links
    expect(links.items).toHaveLength(9)
  })
})
