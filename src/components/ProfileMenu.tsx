import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../app/features/authSlice";
import { humanize } from "../utils/format";
import Avatar from "./Avatar";
import DropdownMenu from "./DropdownMenu";

export default function ProfileMenu() {
  const dispatch = useAppDispatch();
  const { firstName, lastName, userType, profileImageUrl } = useAppSelector(
    (state) => state.auth
  );

  return (
    <DropdownMenu
      align="right"
      menuClassName="w-56"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex cursor-pointer items-center gap-2 rounded-md py-1 pr-2 pl-1 hover:bg-secondary"
        >
          <Avatar
            src={profileImageUrl}
            firstName={firstName}
            lastName={lastName}
            size="sm"
          />
          <span className="hidden text-sm text-foreground sm:inline">
            {firstName}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-muted-foreground"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    >
      {({ close }) => (
        <>
          <div className="flex items-center gap-3 border-b border-border px-3 py-3">
            <Avatar src={profileImageUrl} firstName={firstName} lastName={lastName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {firstName} {lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userType ? humanize(userType) : ""}
              </p>
            </div>
          </div>

          <Link
            to="/profile/edit"
            role="menuitem"
            className="block px-3 py-2 text-sm text-foreground hover:bg-secondary"
            onClick={close}
          >
            Edit profile
          </Link>
          <Link
            to="/change-password"
            role="menuitem"
            className="block px-3 py-2 text-sm text-foreground hover:bg-secondary"
            onClick={close}
          >
            Change password
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-danger hover:bg-secondary"
            onClick={() => {
              close();
              dispatch(logout());
            }}
          >
            Log out
          </button>
        </>
      )}
    </DropdownMenu>
  );
}
