import type { RequestParameters } from "./api"

export interface FileParameters extends RequestParameters {
  uploadedBy?: string
}

export interface FileResponse {
  id: string
  fileName: string
  contentType: string
  createdAt: string
  uploadedBy: string
  uploadedById: string
}

export interface FileDetailsResponse {
  id: string
  fileName: string
  contentType: string
  encryptionPolicy: string
  createdAt: string
}

export interface UpdateFilePolicyRequest {
  policyId: string
}
