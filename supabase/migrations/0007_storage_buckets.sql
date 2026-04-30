-- ─────────────────────────────────────────────────────────────────────────────
-- 0007_storage_buckets · Create storage buckets in production.
-- (config.toml only configures buckets in local dev; production needs SQL.)
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('item-images', 'item-images', true, 5242880,
    array['image/png', 'image/jpeg', 'image/webp']),
  ('accountability-proofs', 'accountability-proofs', true, 10485760,
    array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']),
  ('donor-uploads', 'donor-uploads', false, 5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
