export async function getFilters(apiClient, type): Promise<any[]> {
  const response = await apiClient.get('filters', { type })
  return response.data ?? []
}
