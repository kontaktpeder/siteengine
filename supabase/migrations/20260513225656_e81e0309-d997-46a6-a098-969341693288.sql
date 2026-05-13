insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

create policy "Public read media"
on storage.objects for select
using (bucket_id = 'media');

create policy "Anyone can upload to media"
on storage.objects for insert
with check (bucket_id = 'media');

create policy "Anyone can update media"
on storage.objects for update
using (bucket_id = 'media');

create policy "Anyone can delete media"
on storage.objects for delete
using (bucket_id = 'media');