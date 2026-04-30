-- ─────────────────────────────────────────────────────────────────────────────
-- 0006_storage_policies · Storage bucket RLS policies.
-- Buckets are declared in supabase/config.toml. Policies live here.
-- ─────────────────────────────────────────────────────────────────────────────

-- Public read for item-images
drop policy if exists "item-images: public read" on storage.objects;
create policy "item-images: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'item-images');

drop policy if exists "item-images: admin write" on storage.objects;
create policy "item-images: admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-images' and public.is_admin(auth.uid()));

drop policy if exists "item-images: admin update" on storage.objects;
create policy "item-images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'item-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'item-images' and public.is_admin(auth.uid()));

drop policy if exists "item-images: admin delete" on storage.objects;
create policy "item-images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-images' and public.is_admin(auth.uid()));

-- Public read for accountability-proofs
drop policy if exists "accountability-proofs: public read" on storage.objects;
create policy "accountability-proofs: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'accountability-proofs');

drop policy if exists "accountability-proofs: admin write" on storage.objects;
create policy "accountability-proofs: admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'accountability-proofs' and public.is_admin(auth.uid()));

drop policy if exists "accountability-proofs: admin update" on storage.objects;
create policy "accountability-proofs: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'accountability-proofs' and public.is_admin(auth.uid()))
  with check (bucket_id = 'accountability-proofs' and public.is_admin(auth.uid()));

drop policy if exists "accountability-proofs: admin delete" on storage.objects;
create policy "accountability-proofs: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'accountability-proofs' and public.is_admin(auth.uid()));

-- Private donor-uploads (admin only read + write)
drop policy if exists "donor-uploads: admin read" on storage.objects;
create policy "donor-uploads: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'donor-uploads' and public.is_admin(auth.uid()));

drop policy if exists "donor-uploads: admin write" on storage.objects;
create policy "donor-uploads: admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'donor-uploads' and public.is_admin(auth.uid()));

drop policy if exists "donor-uploads: admin update" on storage.objects;
create policy "donor-uploads: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'donor-uploads' and public.is_admin(auth.uid()))
  with check (bucket_id = 'donor-uploads' and public.is_admin(auth.uid()));

drop policy if exists "donor-uploads: admin delete" on storage.objects;
create policy "donor-uploads: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'donor-uploads' and public.is_admin(auth.uid()));
