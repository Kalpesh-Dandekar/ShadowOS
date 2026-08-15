import { AuthForm } from "./auth-form";
import { AuthShell } from "./auth-shell";

export function LoginScreen() {
  return <AuthShell><AuthForm mode="login" /></AuthShell>;
}
