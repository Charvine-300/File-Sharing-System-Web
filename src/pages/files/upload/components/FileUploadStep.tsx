import { useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { uploadFile } from "../../../../app/features/uploadsMgmtSlice";
import Spinner from "../../../../components/Spinner";
import { ACCEPT_ATTRIBUTE, ALLOWED_FILE_EXTENSIONS, isAllowedFile } from "../../../../utils/fileTypes";
import type { AllPoliciesResponse } from "../../../../types/policyMgmt";

interface FileUploadStepProps {
  policy: AllPoliciesResponse;
  onBack: () => void;
}

export default function FileUploadStep({ policy, onBack }: FileUploadStepProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const uploading = useAppSelector((state) => state.uploadsMgmt.uploading);
  const uploadProgress = useAppSelector((state) => state.uploadsMgmt.uploadProgress);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFile(candidate: File | undefined) {
    if (!candidate) return;

    if (!isAllowedFile(candidate)) {
      setFileError(
        candidate.name.toLowerCase().endsWith(".pdf")
          ? "PDF files are not supported."
          : "That file type isn't supported."
      );
      setFile(null);
      return;
    }

    setFileError(null);
    setFile(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit() {
    if (!file) return;
    const result = await dispatch(uploadFile({ file, policyId: policy.id }));
    if (uploadFile.fulfilled.match(result)) {
      navigate("/files", { replace: true });
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1>Upload your file</h1>
        <p className="text-sm text-muted-foreground">
          Protected by <span className="font-medium text-foreground">{policy.policyName}</span>.{" "}
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer text-primary hover:underline"
          >
            Change policy
          </button>
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`file-drop-zone ${dragActive ? "border-primary bg-accent" : ""}`}
      >
        {file ? (
          <>
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="cursor-pointer text-xs text-danger hover:underline"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <p>Drag and drop a file here, or</p>
            <label className="cursor-pointer text-primary hover:underline">
              browse your device
              <input
                type="file"
                className="hidden"
                accept={ACCEPT_ATTRIBUTE}
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Allowed: {ALLOWED_FILE_EXTENSIONS.join(", ")} — PDFs are not
              supported. One file at a time.
            </p>
          </>
        )}
      </div>
      {fileError && <p className="mt-2 text-xs text-danger">{fileError}</p>}

      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Uploading and encrypting... {uploadProgress}%
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn outline-btn mt-0 flex-1"
          disabled={uploading}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn primary-btn normal-btn mt-0 flex-1 inline-flex items-center justify-center gap-2"
          disabled={!file || uploading}
        >
          {uploading && <Spinner size="sm" variant="on-primary" />}
          {uploading ? "Uploading..." : "Upload file"}
        </button>
      </div>
    </div>
  );
}
