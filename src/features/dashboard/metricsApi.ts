import { dashboardMetricsSchema } from '../../shared/api/contract.ts'
import type { DashboardMetrics } from '../../shared/api/contract.ts'
import { request } from '../../shared/api/httpClient.ts'

export async function getDashboardMetrics(
  signal?: AbortSignal,
): Promise<DashboardMetrics> {
  return await request('/metrics/dashboard', {
    schema: dashboardMetricsSchema,
    signal,
  })
}
