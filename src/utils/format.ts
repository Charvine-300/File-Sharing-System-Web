// Spaces out PascalCase/camelCase backend values for display, e.g. "SuperAdmin" -> "Super Admin".
export function humanize(value: string): string {
  if (!value) return value;

  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

// Inverse of humanize, for values sent to the backend: merges multi-word input into
// PascalCase, e.g. "Creative Manager" -> "CreativeManager".
export function toPascalCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
