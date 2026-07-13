import { useCan } from "../../../hooks/usePermission";
import DropdownMenu from "../../../components/DropdownMenu";
import type { AllUsersResponse } from "../../../types/userMgmt";

interface UserRowActionsProps {
  user: AllUsersResponse;
  onManageAttributes: (user: AllUsersResponse) => void;
  onToggleStatus: (user: AllUsersResponse) => void;
  onDelete: (user: AllUsersResponse) => void;
}

export default function UserRowActions({
  user,
  onManageAttributes,
  onToggleStatus,
  onDelete,
}: UserRowActionsProps) {
  const canManageAttributes = useCan("users.updateAttributes");
  const canToggleStatus = useCan("users.updateStatus");
  const canDelete = useCan("users.delete");

  if (!canManageAttributes && !canToggleStatus && !canDelete) {
    return null;
  }

  return (
    <DropdownMenu
      align="right"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="User actions"
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
          {canManageAttributes && (
            <button
              type="button"
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
              onClick={() => {
                close();
                onManageAttributes(user);
              }}
            >
              Manage attributes
            </button>
          )}
          {canToggleStatus && (
            <button
              type="button"
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
              onClick={() => {
                close();
                onToggleStatus(user);
              }}
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              role="menuitem"
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-danger hover:bg-secondary"
              onClick={() => {
                close();
                onDelete(user);
              }}
            >
              Delete
            </button>
          )}
        </>
      )}
    </DropdownMenu>
  );
}
