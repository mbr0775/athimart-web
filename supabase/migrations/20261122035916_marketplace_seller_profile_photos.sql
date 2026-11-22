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

-- Keep the newer public projection compatible with mobile JPG/PNG uploads.
create or replace function marketplace_private.seller_photo_projection(shop_ids uuid[])
returns table (id uuid, object_path text, avatar_url text)
language sql stable security definer set search_path = '' as $$
  select p.id, uploaded.name,
    case
      when uploaded.name is not null then null
      when p.avatar_url ~ '^https://([a-z0-9-]+[.])*googleusercontent[.]com/' then p.avatar_url
      when u.raw_user_meta_data->>'avatar_url' ~ '^https://([a-z0-9-]+[.])*googleusercontent[.]com/' then u.raw_user_meta_data->>'avatar_url'
      when u.raw_user_meta_data->>'picture' ~ '^https://([a-z0-9-]+[.])*googleusercontent[.]com/' then u.raw_user_meta_data->>'picture'
      else null
    end
  from public.profiles p
  left join storage.objects uploaded
    on uploaded.bucket_id = 'profile-avatars'
    and uploaded.name = split_part(p.avatar_url, '/storage/v1/object/public/profile-avatars/', 2)
    and uploaded.name ~* ('^' || p.id::text || '/[a-z0-9_-]+[.](webp|png|jpe?g)$')
    and p.avatar_url ~ '^https://[^/@?#]+/storage/v1/object/public/profile-avatars/'
    and exists (select 1 from storage.buckets b where b.id=uploaded.bucket_id and b.public)
  left join auth.users u on u.id=p.id
  where cardinality(shop_ids) between 1 and 9
    and p.id=any(shop_ids)
    and p.role::text in ('vendor','seller')
    and p.seller_approval_status::text='approved'
    and p.is_blocked is not true;
$$;
revoke all on function marketplace_private.seller_photo_projection(uuid[]) from public, anon, authenticated;
grant execute on function marketplace_private.seller_photo_projection(uuid[]) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
