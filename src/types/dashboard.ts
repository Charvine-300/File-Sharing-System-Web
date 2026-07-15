export interface DashboardSummaryResponse {
  totalFiles: number
  totalUsers: number
  totalPolicies: number
}

export interface RecentFileResponse {
  id: string
  fileName: string
  uploadedBy: string
  policy: string
  uploadedAt: string
}
