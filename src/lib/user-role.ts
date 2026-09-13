import { UserRole } from "../../generated/prisma";

export function hasAdminPrivileges(
  role: UserRole | null | undefined,
): boolean {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === UserRole.ADMIN;
}
