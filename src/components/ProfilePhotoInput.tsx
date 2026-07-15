import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { validateProfilePhoto } from "../utils/profilePhoto";

interface ProfilePhotoInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  currentPhotoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export default function ProfilePhotoInput({
  value,
  onChange,
  currentPhotoUrl,
  firstName,
  lastName,
}: ProfilePhotoInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ?? null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(currentPhotoUrl ?? null);
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value, currentPhotoUrl]);

  function handleFile(candidate: File | undefined) {
    if (!candidate) return;

    const validationError = validateProfilePhoto(candidate);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onChange(candidate);
  }

  return (
    <div className="input-field-group">
      <span className="label">Profile photo</span>
      <div className="flex items-center gap-4">
        <Avatar src={previewUrl} firstName={firstName} lastName={lastName} />
        <div>
          <label className="cursor-pointer text-sm text-primary hover:underline">
            {value ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-3 cursor-pointer text-xs text-danger hover:underline"
            >
              Remove
            </button>
          )}
          <p className="text-xs text-muted-foreground">JPG or PNG, up to 3MB.</p>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
