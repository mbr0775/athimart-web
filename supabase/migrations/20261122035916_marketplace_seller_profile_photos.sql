-- Read the current account upload for approved public shops only.
-- Also installs the lookup on projects that missed the original avatar migration.
begin;

create or replace function public.find_marketplace_shop_avatar_paths(shop_ids uuid[])
returns table (id uuid, object_path text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, o.name
  from public.profiles as p
  join storage.objects as o
    on o.bucket_id = 'profile-avatars'
   and o.name = split_part(p.avatar_url, '/storage/v1/object/public/profile-avatars/', 2)
  join storage.buckets as b on b.id = o.bucket_id and b.public
  where cardinality(shop_ids) between 1 and 9
    and p.id = any(shop_ids)
    and p.role in ('vendor', 'seller')
    and p.seller_approval_status = 'approved'
    and p.is_blocked is not true
    and p.avatar_url ~* (
      '^https://[^/@?#]+/storage/v1/object/public/profile-avatars/' ||
      p.id::text || '/[a-z0-9_-]+[.](webp|png|jpe?g)$'
    )
$$;

revoke all on function public.find_marketplace_shop_avatar_paths(uuid[]) from public, anon, authenticated;
grant execute on function public.find_marketplace_shop_avatar_paths(uuid[]) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
