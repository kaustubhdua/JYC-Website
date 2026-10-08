-- V64: harden trigger-only media guards and cover lookup performance.
revoke execute on function public.jyc_guard_published_gallery_item() from public, anon, authenticated;
revoke execute on function public.jyc_guard_media_album_publication() from public, anon, authenticated;

create index if not exists jyc_media_albums_cover_gallery_item_id_idx
  on public.jyc_media_albums(cover_gallery_item_id);
