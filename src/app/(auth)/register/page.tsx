import { getEnabledSsoProviders } from "@/lib/sso";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return <RegisterForm ssoProviders={getEnabledSsoProviders()} />;
}
