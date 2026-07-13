import { humanize } from "../../../../utils/format";
import type { BuilderNode } from "../../../../utils/policyBuilder";
import type { AllAttributesResponse } from "../../../../types/attributeMgmt";
import type { PolicyOperator } from "../../../../types/policyMgmt";

interface PolicyNodeEditorProps {
  node: BuilderNode;
  depth: number;
  catalog: AllAttributesResponse[];
  onAddLeaf: (groupKey: string) => void;
  onAddGroup: (groupKey: string) => void;
  onSetAttribute: (leafKey: string, attributeId: string) => void;
  onSetOperator: (groupKey: string, operator: PolicyOperator) => void;
  onRemove: (key: string) => void;
  isRoot?: boolean;
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
    </svg>
  );
}

export default function PolicyNodeEditor({
  node,
  depth,
  catalog,
  onAddLeaf,
  onAddGroup,
  onSetAttribute,
  onSetOperator,
  onRemove,
  isRoot = false,
}: PolicyNodeEditorProps) {
  if (node.kind === "leaf") {
    return (
      <div className="flex items-center gap-2">
        <select
          className="input"
          value={node.attributeId}
          onChange={(event) => onSetAttribute(node.key, event.target.value)}
        >
          <option value="">Select an attribute...</option>
          {catalog.map((attribute) => (
            <option key={attribute.id} value={attribute.id}>
              {humanize(attribute.attributeName)} ({humanize(attribute.attributeType)})
            </option>
          ))}
        </select>
        {!isRoot && (
          <button
            type="button"
            onClick={() => onRemove(node.key)}
            aria-label="Remove condition"
            className="shrink-0 cursor-pointer text-muted-foreground hover:text-danger"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        depth > 0
          ? "flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3"
          : "flex flex-col gap-3"
      }
    >
      <div className="flex items-center justify-between gap-2">
        {node.children.length > 1 ? (
          <div className="inline-flex overflow-hidden rounded-md border border-border text-xs font-medium">
            <button
              type="button"
              onClick={() => onSetOperator(node.key, "And")}
              className={`cursor-pointer px-3 py-1 ${
                node.operator === "And"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              AND
            </button>
            <button
              type="button"
              onClick={() => onSetOperator(node.key, "Or")}
              className={`cursor-pointer px-3 py-1 ${
                node.operator === "Or"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              OR
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Condition</span>
        )}
        {!isRoot && (
          <button
            type="button"
            onClick={() => onRemove(node.key)}
            aria-label="Remove group"
            className="cursor-pointer text-muted-foreground hover:text-danger"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {node.children.map((child) => (
          <PolicyNodeEditor
            key={child.key}
            node={child}
            depth={depth + 1}
            catalog={catalog}
            onAddLeaf={onAddLeaf}
            onAddGroup={onAddGroup}
            onSetAttribute={onSetAttribute}
            onSetOperator={onSetOperator}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        <button
          type="button"
          onClick={() => onAddLeaf(node.key)}
          className="cursor-pointer text-primary hover:underline"
        >
          + Add condition
        </button>
        <button
          type="button"
          onClick={() => onAddGroup(node.key)}
          className="cursor-pointer text-primary hover:underline"
        >
          + Add group
        </button>
      </div>
    </div>
  );
}
