// PDFs are explicitly excluded — everything else in this list is allowed.
export const ALLOWED_FILE_EXTENSIONS = [
  ".txt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
] as const;

export const ACCEPT_ATTRIBUTE = ALLOWED_FILE_EXTENSIONS.join(",");

export function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return false;
  return ALLOWED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
}
