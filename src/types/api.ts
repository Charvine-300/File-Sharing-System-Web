export interface ApiResponse<T = undefined> {
  isSuccessful: boolean
  statusCode: number
  message: string
  data: T
}

export interface PaginationResponse<T> {
  records: T[]
  totalRecords: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Mirrors the backend's `RequestParameters` base class — shared by every
// paginated list endpoint's query parameters (UserParameters, PolicyParameters, ...).
export interface RequestParameters {
  search?: string
  startDate?: string
  endDate?: string
  pageNumber?: number
  pageSize?: number
}
