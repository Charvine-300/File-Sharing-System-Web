import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { clearSelectedFile, getFile } from "../../../app/features/uploadsMgmtSlice";
import Modal from "../../../components/Modal";
import Spinner from "../../../components/Spinner";
import type { FileResponse } from "../../../types/uploadsMgmt";

interface FileDetailsModalProps {
  file: FileResponse;
  onClose: () => void;
}

export default function FileDetailsModal({ file, onClose }: FileDetailsModalProps) {
  const dispatch = useAppDispatch();
  const selectedFile = useAppSelector((state) => state.uploadsMgmt.selectedFile);
  const detailLoading = useAppSelector((state) => state.uploadsMgmt.detailLoading);

  useEffect(() => {
    dispatch(getFile(file.id));
    return () => {
      dispatch(clearSelectedFile());
    };
  }, [dispatch, file.id]);

  return (
    <Modal title={file.fileName} onClose={onClose}>
      {detailLoading || !selectedFile ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <dl className="flex flex-col gap-3 text-sm">
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
      )}
    </Modal>
  );
}
