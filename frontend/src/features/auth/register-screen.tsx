import { AuthForm } from "./auth-form";
import { AuthShell } from "./auth-shell";

export function RegisterScreen() {
  return <AuthShell><AuthForm mode="register" /></AuthShell>;
}
