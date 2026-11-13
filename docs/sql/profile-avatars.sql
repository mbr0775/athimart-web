-- Run once in the AthiMart project's Supabase SQL Editor.
-- Adds avatar storage; preserves existing profile rows and policies.
begin;

alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 614400, array['image/webp'])
on conflict (id) do nothing;

-- Reuse existing profiles SELECT / UPDATE ownership policies (the same
-- policies used by contact & delivery editing). These column grants also
-- support projects with column-level privileges, without granting role edits.
grant select (id, full_name, avatar_url, is_blocked) on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'athimart_avatar_insert_own') then
    create policy athimart_avatar_insert_own on storage.objects for insert to authenticated
      with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'athimart_avatar_select_own') then
    create policy athimart_avatar_select_own on storage.objects for select to authenticated
      using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'athimart_avatar_delete_own') then
    create policy athimart_avatar_delete_own on storage.objects for delete to authenticated
      using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
  end if;
end $$;

commit;

-- Verification: expect avatar_url, a public WebP bucket, and three owner-only
-- Storage policies. Profiles must already have owner SELECT / UPDATE policies.
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url';
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'profile-avatars';
select schemaname, tablename, policyname, cmd, qual, with_check from pg_policies
where (schemaname = 'storage' and policyname like 'athimart_avatar_%')
   or (schemaname = 'public' and tablename = 'profiles' and cmd in ('SELECT', 'UPDATE', 'ALL'));
