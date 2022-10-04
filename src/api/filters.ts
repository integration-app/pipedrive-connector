export async function getFilters(apiClient, type): Promise<any[]> {
  const response = await apiClient.get('filters', { type })
  return response.data ?? []
}

export async function getFilterById(apiClient, id): Promise<any> {
  const response = await apiClient.get(`filters/${id}`)
  return response.data ?? []
}
