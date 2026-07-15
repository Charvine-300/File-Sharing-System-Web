import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearSelectedFile, downloadFile, getFile } from "../../app/features/uploadsMgmtSlice";
import Spinner from "../../components/Spinner";

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

export default function FileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedFile = useAppSelector((state) => state.uploadsMgmt.selectedFile);
  const detailLoading = useAppSelector((state) => state.uploadsMgmt.detailLoading);

  useEffect(() => {
    if (!id) return;
    dispatch(getFile(id));
    return () => {
      dispatch(clearSelectedFile());
    };
  }, [dispatch, id]);

  async function handleDownload() {
    if (!id || !selectedFile) return;
    await dispatch(downloadFile({ id, fileName: selectedFile.fileName }));
  }

  if (detailLoading || !selectedFile) {
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
        onClick={() => navigate("/files")}
        className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-primary hover:underline"
      >
        <BackIcon /> Back to files
      </button>

      <div className="card max-w-xl p-6">
        <h1 className="truncate">{selectedFile.fileName}</h1>

        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">File type</dt>
            <dd className="text-foreground">{selectedFile.contentType}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Uploaded</dt>
            <dd className="text-foreground">
              {new Date(selectedFile.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Access policy</dt>
            <dd className="text-foreground">{selectedFile.encryptionPolicy}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={handleDownload}
          className="btn primary-btn normal-btn"
        >
          Download
        </button>
      </div>
    </div>
  );
}
