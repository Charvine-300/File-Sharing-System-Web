import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { can, type Permission } from "../utils/rbac";

interface RequireRoleProps {
  permission: Permission;
  children: JSX.Element;
}

export default function RequireRole({ permission, children }: RequireRoleProps) {
  const userType = useAppSelector((state) => state.auth.userType);

  if (!can(userType, permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
