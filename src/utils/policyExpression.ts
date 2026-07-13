import { humanize } from "./format";
import type { PolicyNodeRequest } from "../types/policyMgmt";

// Mirrors PolicyMgmtService.BuildPolicyExpression exactly (same leaf/operator
// shape, same lowercase "and"/"or" join, same parens) so the string we compute
// client-side is byte-for-byte what the backend will store — this is also how
// we locate a freshly created policy afterwards, since CreatePolicyAsync
// doesn't return the new policy's id.
export function buildPolicyExpression(
  node: PolicyNodeRequest,
  attributeNameById: Map<string, string>
): string {
  if (node.attributeId) {
    const name = attributeNameById.get(node.attributeId);
    if (!name) throw new Error("Attribute does not exist");
    return name;
  }

  if (!node.operator || !node.children || node.children.length < 2) {
    throw new Error("Invalid policy structure");
  }

  const joined = node.children
    .map((child) => buildPolicyExpression(child, attributeNameById))
    .join(` ${node.operator.toLowerCase()} `);

  return `(${joined})`;
}

// Same shape as buildPolicyExpression, but for display: humanized attribute
// names and uppercase AND/OR, and tolerant of an incomplete/single-child tree
// (used for the live preview while the user is still building the rule).
export function buildReadableExpression(
  node: PolicyNodeRequest,
  attributeNameById: Map<string, string>
): string {
  if (node.attributeId) {
    const name = attributeNameById.get(node.attributeId);
    return humanize(name ?? "Unknown attribute");
  }

  if (!node.operator || !node.children || node.children.length === 0) {
    return "";
  }

  if (node.children.length === 1) {
    return buildReadableExpression(node.children[0], attributeNameById);
  }

  const joined = node.children
    .map((child) => buildReadableExpression(child, attributeNameById))
    .join(` ${node.operator.toUpperCase()} `);

  return `(${joined})`;
}
