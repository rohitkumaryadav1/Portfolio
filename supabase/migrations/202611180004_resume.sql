begin;
update public.profile set data=jsonb_build_object('resume_path','initial/rohit-resume.pdf')||data;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('portfolio-documents','portfolio-documents',false,4000000,array['application/pdf']);
create function public.is_published_document(object_name text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profile where published and data->>'resume_path'=object_name);
$$;
revoke all on function public.is_published_document(text) from public;
grant execute on function public.is_published_document(text) to anon,authenticated;
create policy documents_read on storage.objects for select to anon,authenticated using(bucket_id='portfolio-documents' and (public.is_admin() or public.is_published_document(name)));
create policy documents_insert on storage.objects for insert to authenticated with check(bucket_id='portfolio-documents' and public.is_admin());
create policy documents_delete on storage.objects for delete to authenticated using(bucket_id='portfolio-documents' and public.is_admin());
commit;
