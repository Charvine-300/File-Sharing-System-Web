import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { deleteFile, downloadFile, getFiles } from "../../app/features/uploadsMgmtSlice";
import { useListLoadingState } from "../../hooks/useListLoadingState";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import ConfirmDialog from "../../components/ConfirmDialog";
import FilterBar, { type ActiveFilter, type FilterFieldDef } from "../../components/FilterBar";
import FileCard from "./components/FileCard";
import FileDetailsModal from "./components/FileDetailsModal";
import ChangeFilePolicyModal from "./components/ChangeFilePolicyModal";
import type { FileParameters, FileResponse } from "../../types/uploadsMgmt";

function buildFileParameters(activeFilters: ActiveFilter[], pageNumber: number): FileParameters {
  const params: FileParameters = { pageNumber, pageSize: 10 };

  for (const filter of activeFilters) {
    if (filter.key === "search") params.search = filter.value;
    if (filter.key === "startDate") params.startDate = filter.value;
    if (filter.key === "endDate") params.endDate = filter.value;
    if (filter.key === "uploadedBy") params.uploadedBy = filter.value;
  }

  return params;
}

export default function FilesList() {
  const dispatch = useAppDispatch();
  const { files, loading, currentPage, totalPages, totalRecords, pageSize } = useAppSelector(
    (state) => state.uploadsMgmt
  );
  const userId = useAppSelector((state) => state.auth.userId);
  const { showFullLoader, showInlineLoader } = useListLoadingState(loading, files.length);

  const fileFilterFields: FilterFieldDef[] = [
    { key: "search", label: "File name", type: "text", placeholder: "Search..." },
    { key: "startDate", label: "Uploaded after", type: "date" },
    { key: "endDate", label: "Uploaded before", type: "date" },
    ...(userId
      ? [
          {
            key: "uploadedBy",
            label: "Uploaded by",
            type: "select" as const,
            options: [{ value: userId, label: "Me" }],
          },
        ]
      : []),
  ];

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [detailsFile, setDetailsFile] = useState<FileResponse | null>(null);
  const [changingPolicyFile, setChangingPolicyFile] = useState<FileResponse | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileResponse | null>(null);

  useEffect(() => {
    dispatch(getFiles(buildFileParameters(activeFilters, pageNumber)));
  }, [dispatch, activeFilters, pageNumber]);

  function handleAddFilter(key: string, value: string) {
    setActiveFilters((prev) => [...prev.filter((filter) => filter.key !== key), { key, value }]);
    setPageNumber(1);
  }

  function handleRemoveFilter(key: string) {
    setActiveFilters((prev) => prev.filter((filter) => filter.key !== key));
    setPageNumber(1);
  }

  function handleClearAllFilters() {
    setActiveFilters([]);
    setPageNumber(1);
  }

  async function handleDownload(file: FileResponse) {
    await dispatch(downloadFile({ id: file.id, fileName: file.fileName }));
  }

  function refetch() {
    dispatch(getFiles(buildFileParameters(activeFilters, pageNumber)));
  }

  async function handleConfirmDelete() {
    if (!deletingFile) return;
    await dispatch(deleteFile(deletingFile.id));
    setDeletingFile(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Files</h1>
          <p className="text-sm text-muted-foreground">
            The files you're authorized to see and manage
          </p>
        </div>
        <Link
          to="/files/upload"
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:ring-4 hover:ring-primary/30"
        >
          Upload file
        </Link>
      </div>

      <FilterBar
        fields={fileFilterFields}
        activeFilters={activeFilters}
        onAdd={handleAddFilter}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {showFullLoader ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : files.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No files uploaded yet.
        </div>
      ) : (
        <>
          {showInlineLoader && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner size="sm" /> Updating...
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
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
        </>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={setPageNumber}
        />
      </div>

      {detailsFile && (
        <FileDetailsModal file={detailsFile} onClose={() => setDetailsFile(null)} />
      )}

      {changingPolicyFile && (
        <ChangeFilePolicyModal
          file={changingPolicyFile}
          onClose={() => setChangingPolicyFile(null)}
          onChanged={refetch}
        />
      )}

      {deletingFile && (
        <ConfirmDialog
          title="Delete file"
          message={`Delete "${deletingFile.fileName}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingFile(null)}
        />
      )}
    </div>
  );
}
