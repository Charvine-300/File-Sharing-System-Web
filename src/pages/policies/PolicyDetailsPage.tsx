import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearSelectedPolicy, getPolicy } from "../../app/features/policyMgmtSlice";
import { deleteFile, downloadFile } from "../../app/features/uploadsMgmtSlice";
import Spinner from "../../components/Spinner";
import ConfirmDialog from "../../components/ConfirmDialog";
import FileCard from "../files/components/FileCard";
import FileDetailsModal from "../files/components/FileDetailsModal";
import ChangeFilePolicyModal from "../files/components/ChangeFilePolicyModal";
import type { FileResponse } from "../../types/uploadsMgmt";

function BackIcon() {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function PolicyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedPolicy = useAppSelector((state) => state.policyMgmt.selectedPolicy);
  const detailLoading = useAppSelector((state) => state.policyMgmt.detailLoading);

  const [detailsFile, setDetailsFile] = useState<FileResponse | null>(null);
  const [changingPolicyFile, setChangingPolicyFile] = useState<FileResponse | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    dispatch(getPolicy(id));
    return () => {
      dispatch(clearSelectedPolicy());
    };
  }, [dispatch, id]);

  async function handleDownload(file: FileResponse) {
    await dispatch(downloadFile({ id: file.id, fileName: file.fileName }));
  }

  async function handleConfirmDeleteFile() {
    if (!deletingFile || !id) return;
    await dispatch(deleteFile(deletingFile.id));
    setDeletingFile(null);
    dispatch(getPolicy(id));
  }

  if (detailLoading || !selectedPolicy) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/policies")}
        className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-primary hover:underline"
      >
        <BackIcon /> Back to policies
      </button>

      <div className="card mb-6 p-6">
        <div className="flex items-center gap-2">
          <h1>{selectedPolicy.policyName}</h1>
          {selectedPolicy.isSystemPolicy && (
            <span className="badge bg-accent text-accent-foreground">System</span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{selectedPolicy.description}</p>

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Access rule</p>
          <code className="mt-1 block w-full overflow-x-auto rounded bg-muted px-3 py-2 text-xs text-foreground">
            {selectedPolicy.policyExpression}
          </code>
        </div>
      </div>

      <h2 className="mb-3">Files encrypted by this policy</h2>
      {selectedPolicy.encryptedFiles.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No files have been uploaded with this policy yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedPolicy.encryptedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onViewDetails={setDetailsFile}
              onDownload={handleDownload}
              onChangePolicy={setChangingPolicyFile}
              onDelete={setDeletingFile}
            />
          ))}
        </div>
      )}

      {detailsFile && (
        <FileDetailsModal file={detailsFile} onClose={() => setDetailsFile(null)} />
      )}

      {changingPolicyFile && (
        <ChangeFilePolicyModal
          file={changingPolicyFile}
          onClose={() => setChangingPolicyFile(null)}
          onChanged={() => {
            if (id) dispatch(getPolicy(id));
          }}
        />
      )}

      {deletingFile && (
        <ConfirmDialog
          title="Delete file"
          message={`Delete "${deletingFile.fileName}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleConfirmDeleteFile}
          onCancel={() => setDeletingFile(null)}
        />
      )}
    </div>
  );
}
