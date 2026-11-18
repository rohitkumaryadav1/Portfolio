import 'server-only';
import { supabase, configured } from './supabase';
import { type Table, type Row, schemas } from './content';
export async function read<K extends Table>(table: K): Promise<Row<K>[]> {
  if (!configured()) return [];
  const db = await supabase();
  const { data, error } = await db
    .from(table)
    .select('*')
    .eq('published', true)
    .order('display_order');
  if (error) throw new Error('Portfolio content could not be loaded. Please try again.');
  return (data ?? []).map((row) => ({ ...row, data: schemas[table].parse(row.data) })) as Row<K>[];
}
export function mediaUrl(path: string) {
  return path ? '/media/' + path : '';
}
