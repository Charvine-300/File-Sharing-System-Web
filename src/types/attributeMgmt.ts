// Mirrors the backend `AttributeType` enum (FinalYearProject.Data.Domain.Entities.Shared).
export const ATTRIBUTE_TYPES = ["Role", "Department", "ClearanceLevel", "Other"] as const;
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

export interface AttributeParameters {
  search?: string
  attributeType?: string
  pageNumber?: number
  pageSize?: number
}

export interface AllAttributesResponse {
  id: string
  attributeName: string
  attributeType: string
}

export interface AttributeDetailsResponse {
  id: string
  attributeName: string
  attributeType: string
}

export interface AttributeMgmtRequest {
  attributeName: string
  attributeType: AttributeType
}
