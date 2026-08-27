export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";

export type UserStatus = "ACTIVE" | "DISABLED";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string };
