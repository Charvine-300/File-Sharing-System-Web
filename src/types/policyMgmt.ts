import type { RequestParameters } from "./api"

// Mirrors the backend `PolicyOperator` enum.
export const POLICY_OPERATORS = ["And", "Or"] as const
export type PolicyOperator = (typeof POLICY_OPERATORS)[number]

export interface PolicyParameters extends RequestParameters {}

export interface AllPoliciesResponse {
  id: string
  policyName: string
  policyExpression: string
  isSystemPolicy: boolean
}

export interface PolicyDetailsResponse {
  id: string
  policyName: string
  policyExpression: string
  description: string
  isSystemPolicy: boolean
}

export interface PolicyNodeRequest {
  attributeId?: string
  operator?: PolicyOperator
  children?: PolicyNodeRequest[]
}

export interface CreatePolicyRequest {
  policyName: string
  description: string
  rules: PolicyNodeRequest
}

export interface UpdatePolicyRequest {
  policyName: string
  description: string
}
