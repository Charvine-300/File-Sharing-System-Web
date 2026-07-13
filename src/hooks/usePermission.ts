import { useAppSelector } from "../app/hooks";
import { can, type Permission } from "../utils/rbac";

export function useCan(permission: Permission): boolean {
  const userType = useAppSelector((state) => state.auth.userType);
  return can(userType, permission);
}
