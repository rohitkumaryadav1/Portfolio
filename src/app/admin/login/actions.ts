'use server';
import { redirect } from 'next/navigation';
import { supabase, configured } from '@/lib/supabase';
export async function login(form: FormData) {
  if (!configured()) redirect('/admin/login?error=setup');
  const email = String(form.get('email') ?? '').slice(0, 254),
    password = String(form.get('password') ?? '').slice(0, 1024);
  const db = await supabase();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) redirect('/admin/login?error=invalid');
  const { data: admin } = await db.rpc('is_admin');
  if (!admin) {
    await db.auth.signOut();
    redirect('/admin/login?error=invalid');
  }
  redirect('/admin');
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  redirect('/admin/login');
}
