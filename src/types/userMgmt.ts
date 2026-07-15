import type { RequestParameters } from "./api"

export interface UserParameters extends RequestParameters {
  isActive?: boolean
}

export interface AllUsersResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
}

export interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  attributes: string[]
  // Not confirmed on this DTO — added speculatively to mirror LoginResponse's
  // ProfilePhotoUrl. Harmless if absent; used opportunistically if present.
  profilePhotoUrl?: string
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  attributes: string[]
  profilePhoto?: File
}

export interface UpdateUserRequest {
  firstName: string
  lastName: string
  email: string
}

export interface UpdateUserAttributesRequest {
  attributes: string[]
}

export interface UserStatusRequest {
  isActive: boolean
}
