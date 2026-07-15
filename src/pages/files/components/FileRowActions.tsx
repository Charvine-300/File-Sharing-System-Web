import DropdownMenu from "../../../components/DropdownMenu";
import type { FileResponse } from "../../../types/uploadsMgmt";

interface FileRowActionsProps {
  file: FileResponse;
  canChangePolicy: boolean;
  onViewDetails: (file: FileResponse) => void;
  onDownload: (file: FileResponse) => void;
  onChangePolicy: (file: FileResponse) => void;
  onDelete: (file: FileResponse) => void;
}

export default function FileRowActions({
  file,
  canChangePolicy,
  onViewDetails,
  onDownload,
  onChangePolicy,
  onDelete,
}: FileRowActionsProps) {
  return (
    <DropdownMenu
      align="right"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="File actions"
          className="cursor-pointer rounded-md p-1.5 hover:bg-secondary"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      )}
    >
      {({ close }) => (
        <>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => {
              close();
              onViewDetails(file);
            }}
          >
            View details
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => {
              close();
              onDownload(file);
            }}
          >
            Download
          </button>
          {canChangePolicy && (
            <button
              type="button"
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
              onClick={() => {
                close();
                onChangePolicy(file);
              }}
            >
              Change policy
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-danger hover:bg-secondary"
            onClick={() => {
              close();
              onDelete(file);
            }}
          >
            Delete
          </button>
        </>
      )}
    </DropdownMenu>
  );
}
