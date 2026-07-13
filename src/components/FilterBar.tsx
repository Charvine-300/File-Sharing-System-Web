import { useState, type FormEvent } from "react";
import DropdownMenu from "./DropdownMenu";

export type FilterFieldType = "text" | "select" | "date";

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterFieldDef {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterFieldOption[];
  placeholder?: string;
}

export interface ActiveFilter {
  key: string;
  value: string;
}

interface FilterBarProps {
  fields: FilterFieldDef[];
  activeFilters: ActiveFilter[];
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

interface AddFilterFormProps {
  fields: FilterFieldDef[];
  onAdd: (key: string, value: string) => void;
}

function AddFilterForm({ fields, onAdd }: AddFilterFormProps) {
  const [fieldKey, setFieldKey] = useState(fields[0]?.key ?? "");
  const [value, setValue] = useState("");

  const field = fields.find((candidate) => candidate.key === fieldKey);

  function handleFieldChange(key: string) {
    setFieldKey(key);
    setValue("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fieldKey || !value) return;
    onAdd(fieldKey, value);
  }

  if (!field) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-1">
        <label className="label">Filter by</label>
        <select
          className="input"
          value={fieldKey}
          onChange={(event) => handleFieldChange(event.target.value)}
        >
          {fields.map((candidate) => (
            <option key={candidate.key} value={candidate.key}>
              {candidate.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="label">Value</label>
        {field.type === "select" ? (
          <select
            className="input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "date" ? (
          <input
            type="date"
            className="input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        ) : (
          <input
            type="text"
            className="input"
            placeholder={field.placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
      </div>

      <button
        type="submit"
        disabled={!value}
        className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:ring-4 hover:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add filter
      </button>
    </form>
  );
}

export default function FilterBar({
  fields,
  activeFilters,
  onAdd,
  onRemove,
  onClearAll,
}: FilterBarProps) {
  const availableFields = fields.filter(
    (field) => !activeFilters.some((filter) => filter.key === field.key)
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {availableFields.length > 0 && (
        <DropdownMenu
          align="left"
          menuClassName="w-72"
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={open}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
            >
              <PlusIcon />
              Add filter
            </button>
          )}
        >
          {({ close }) => (
            <AddFilterForm
              fields={availableFields}
              onAdd={(key, value) => {
                onAdd(key, value);
                close();
              }}
            />
          )}
        </DropdownMenu>
      )}

      {activeFilters.map((filter) => {
        const field = fields.find((candidate) => candidate.key === filter.key);
        if (!field) return null;

        const displayValue =
          field.options?.find((option) => option.value === filter.value)?.label ??
          filter.value;

        return (
          <span
            key={filter.key}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
          >
            <span className="font-medium">{field.label}:</span> {displayValue}
            <button
              type="button"
              onClick={() => onRemove(filter.key)}
              aria-label={`Remove ${field.label} filter`}
              className="cursor-pointer text-accent-foreground/70 hover:text-accent-foreground"
            >
              <CloseIcon />
            </button>
          </span>
        );
      })}

      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="cursor-pointer text-xs text-muted-foreground hover:text-danger hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
