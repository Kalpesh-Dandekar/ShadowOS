import { AuthForm } from "./auth-form";
import { PublicAuthGuard } from "./auth-guard";
import { AuthShell } from "./auth-shell";

export function RegisterScreen() {
  return <PublicAuthGuard><AuthShell><AuthForm mode="register" /></AuthShell></PublicAuthGuard>;
}
