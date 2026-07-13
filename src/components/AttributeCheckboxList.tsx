import { humanize } from "../utils/format";
import type { AllAttributesResponse } from "../types/attributeMgmt";

interface AttributeCheckboxListProps {
  attributes: AllAttributesResponse[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function AttributeCheckboxList({
  attributes,
  selectedIds,
  onToggle,
}: AttributeCheckboxListProps) {
  if (attributes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No attributes exist yet — create some from the Attributes page first.
      </p>
    );
  }

  return (
    <div className="max-h-56 overflow-y-auto rounded-md border border-border p-2">
      {attributes.map((attribute) => (
        <label
          key={attribute.id}
          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(attribute.id)}
            onChange={() => onToggle(attribute.id)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-foreground">{humanize(attribute.attributeName)}</span>
          <span className="text-xs text-muted-foreground">
            ({attribute.attributeType})
          </span>
        </label>
      ))}
    </div>
  );
}
