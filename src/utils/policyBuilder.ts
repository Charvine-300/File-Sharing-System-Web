import type { PolicyNodeRequest, PolicyOperator } from "../types/policyMgmt";

let keySeed = 0;
function generateKey(): string {
  keySeed += 1;
  return `node-${keySeed}`;
}

export interface BuilderLeaf {
  key: string;
  kind: "leaf";
  attributeId: string; // "" until the user picks one
}

export interface BuilderGroup {
  key: string;
  kind: "group";
  operator: PolicyOperator;
  children: BuilderNode[];
}

export type BuilderNode = BuilderLeaf | BuilderGroup;

export function createLeaf(): BuilderLeaf {
  return { key: generateKey(), kind: "leaf", attributeId: "" };
}

export function createGroup(operator: PolicyOperator = "And"): BuilderGroup {
  return { key: generateKey(), kind: "group", operator, children: [createLeaf()] };
}

export function addLeafToGroup(node: BuilderNode, groupKey: string): BuilderNode {
  if (node.kind !== "group") return node;
  if (node.key === groupKey) {
    return { ...node, children: [...node.children, createLeaf()] };
  }
  return { ...node, children: node.children.map((child) => addLeafToGroup(child, groupKey)) };
}

export function addGroupToGroup(node: BuilderNode, groupKey: string): BuilderNode {
  if (node.kind !== "group") return node;
  if (node.key === groupKey) {
    return { ...node, children: [...node.children, createGroup()] };
  }
  return { ...node, children: node.children.map((child) => addGroupToGroup(child, groupKey)) };
}

export function setLeafAttribute(
  node: BuilderNode,
  leafKey: string,
  attributeId: string
): BuilderNode {
  if (node.kind === "leaf") {
    return node.key === leafKey ? { ...node, attributeId } : node;
  }
  return {
    ...node,
    children: node.children.map((child) => setLeafAttribute(child, leafKey, attributeId)),
  };
}

export function setGroupOperator(
  node: BuilderNode,
  groupKey: string,
  operator: PolicyOperator
): BuilderNode {
  if (node.kind !== "group") return node;
  if (node.key === groupKey) return { ...node, operator };
  return {
    ...node,
    children: node.children.map((child) => setGroupOperator(child, groupKey, operator)),
  };
}

// Removes whichever node has this key, wherever it sits as a direct child.
export function removeNodeByKey(node: BuilderNode, key: string): BuilderNode {
  if (node.kind !== "group") return node;
  return {
    ...node,
    children: node.children
      .filter((child) => child.key !== key)
      .map((child) => removeNodeByKey(child, key)),
  };
}

// A group with exactly one child is redundant (the backend requires >=2
// children for a real operator node) — collapse it down to just that child.
export function toPolicyNodeRequest(node: BuilderNode): PolicyNodeRequest {
  if (node.kind === "leaf") {
    return { attributeId: node.attributeId || undefined };
  }

  const children = node.children.map(toPolicyNodeRequest);
  if (children.length === 1) return children[0];
  return { operator: node.operator, children };
}

export function isTreeComplete(node: BuilderNode): boolean {
  if (node.kind === "leaf") return node.attributeId !== "";
  if (node.children.length === 0) return false;
  return node.children.every(isTreeComplete);
}
