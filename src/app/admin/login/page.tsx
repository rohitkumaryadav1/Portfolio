import { login } from './actions';
import { configured, previewOnly } from '@/lib/supabase';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="login">
      <span className="eyebrow">RKY / PRIVATE WORKSPACE</span>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your portfolio.</p>
      {!configured() || previewOnly() ? (
        <div className="message">
          No administrator account or password has been created yet. This preview is not connected
          to Supabase authentication. Follow the “Create the sole administrator” steps in README.md
          to connect Supabase and choose your password.
        </div>
      ) : (
        <form action={login}>
          <label>
            Email
            <input type="email" name="email" required autoComplete="username" maxLength={254} />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              maxLength={1024}
            />
          </label>
          {error && (
            <p className="message error" role="alert">
              Unable to sign in with this account.
            </p>
          )}
          <button className="button primary">Sign in →</button>
        </form>
      )}
    </main>
  );
}
