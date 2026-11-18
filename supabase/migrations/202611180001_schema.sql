-- Run once in the Supabase SQL editor, followed by the content seed.
begin;
create table public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 singleton boolean not null default true unique check(singleton),
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.admin_users where user_id=(select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end;$$;
do $$declare t text;begin
 foreach t in array array['profile','projects','experiences','skills','education','interests','site_settings'] loop
 execute format('create table public.%I (id uuid primary key default gen_random_uuid(), data jsonb not null check(jsonb_typeof(data)=''object'' and octet_length(data::text)<262144), published boolean not null default false, display_order integer not null default 0 check(display_order between 0 and 100000), created_at timestamptz not null default now(), updated_at timestamptz not null default now())',t);
 execute format('alter table public.%I enable row level security',t);
 execute format('create index on public.%I(published,display_order)',t);
 execute format('create policy public_read on public.%I for select to anon,authenticated using(published or public.is_admin())',t);
 execute format('create policy admin_insert on public.%I for insert to authenticated with check(public.is_admin())',t);
 execute format('create policy admin_update on public.%I for update to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 execute format('create policy admin_delete on public.%I for delete to authenticated using(public.is_admin())',t);
 execute format('create trigger touch_timestamp before update on public.%I for each row execute function public.touch_updated_at()',t);
 execute format('grant select on public.%I to anon,authenticated',t);
 execute format('grant insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;
create unique index one_profile on public.profile ((true));
create unique index one_settings on public.site_settings ((true));
alter table public.projects add constraint project_required check(length(data->>'title')>0 and data->>'status' in ('Completed','In Progress','Experiment') and jsonb_typeof(data->'featured')='boolean');
alter table public.experiences add constraint experience_required check(length(data->>'organization')>0 and length(data->>'position')>0);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio-media','portfolio-media',false,4000000,array['image/webp','image/png','image/jpeg']);
-- Draft media cannot be fetched anonymously even if its path is known.
create function public.is_published_media(object_name text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profile where published and data->>'image'=object_name)
 or exists(select 1 from public.projects where published and (data->>'image'=object_name or coalesce(data->'screenshots','[]'::jsonb) ? object_name));
$$;
revoke all on function public.is_published_media(text) from public;
grant execute on function public.is_published_media(text) to anon,authenticated;
create policy media_read on storage.objects for select to anon,authenticated using(bucket_id='portfolio-media' and (public.is_admin() or public.is_published_media(name)));
create policy media_insert on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and public.is_admin());
create policy media_update on storage.objects for update to authenticated using(bucket_id='portfolio-media' and public.is_admin()) with check(bucket_id='portfolio-media' and public.is_admin());
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and public.is_admin());
commit;
