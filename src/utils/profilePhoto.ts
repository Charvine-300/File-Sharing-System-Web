export const MAX_PROFILE_PHOTO_BYTES = 3 * 1024 * 1024;

export function validateProfilePhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file.";
  }
  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    return "Photo must be 3MB or smaller.";
  }
  return null;
}
