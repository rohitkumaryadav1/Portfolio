import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const configured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const previewOnly = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === 'visual-qa-fixture-only';
export async function supabase() {
  if (!configured()) throw new Error('Supabase is not configured. Follow README.md.');
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              }),
            );
          } catch {
            /* Read-only server component; proxy refreshes cookies. */
          }
        },
      },
    },
  );
}
export async function authorized() {
  const db = await supabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: admin, error: roleError } = await db.rpc('is_admin');
  return !roleError && admin ? db : null;
}
