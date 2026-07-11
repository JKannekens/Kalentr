import { getEnabledSsoProviders } from "@/lib/sso";
import { LoginForm } from "./login-form";

// NextAuth redirects OAuth failures here as /login?error=<code>.
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Sign in the way you originally signed up.",
  AccessDenied: "Access was denied. Please try a different account.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error
    ? (OAUTH_ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.")
    : undefined;

  return (
    <LoginForm ssoProviders={getEnabledSsoProviders()} initialError={initialError} />
  );
}
