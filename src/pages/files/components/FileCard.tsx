import { useAppSelector } from "../../../app/hooks";
import { canChangeFilePolicy } from "../../../utils/rbac";
import { formatDate } from "../../../utils/date";
import FileRowActions from "./FileRowActions";
import type { FileResponse } from "../../../types/uploadsMgmt";

interface FileCardProps {
  file: FileResponse;
  onViewDetails: (file: FileResponse) => void;
  onDownload: (file: FileResponse) => void;
  onChangePolicy: (file: FileResponse) => void;
  onDelete: (file: FileResponse) => void;
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function getExtensionLabel(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "FILE";
  return parts[parts.length - 1].toUpperCase();
}

export default function FileCard({
  file,
  onViewDetails,
  onDownload,
  onChangePolicy,
  onDelete,
}: FileCardProps) {
  const userId = useAppSelector((state) => state.auth.userId);
  const userType = useAppSelector((state) => state.auth.userType);
  const canChangePolicy = canChangeFilePolicy(file.uploadedById, userId, userType);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center mb-10 justify-center rounded-md bg-accent text-accent-foreground">
          <FileIcon />
        </div>
        <FileRowActions
          file={file}
          canChangePolicy={canChangePolicy}
          onViewDetails={onViewDetails}
          onDownload={onDownload}
          onChangePolicy={onChangePolicy}
          onDelete={onDelete}
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground" title={file.fileName}>
          {file.fileName}
        </p>
        <p className="text-xs text-muted-foreground">
          {getExtensionLabel(file.fileName)} · {formatDate(file.createdAt)}
        </p>
      </div>
    </div>
  );
}
