import type { Role, RoleRequestStatus, UserStatus } from "./auth";

export type RoleRequestUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type RoleRequest = {
  id: string;
  requestedRole: "MANAGER";
  status: RoleRequestStatus;
  reviewComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: RoleRequestUser;
  reviewedBy: { id: string; name: string } | null;
};
