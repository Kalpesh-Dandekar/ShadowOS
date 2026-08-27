import { AuthForm } from "./auth-form";
import { PublicAuthGuard } from "./auth-guard";
import { AuthShell } from "./auth-shell";

export function LoginScreen() {
  return <PublicAuthGuard><AuthShell><AuthForm mode="login" /></AuthShell></PublicAuthGuard>;
}
