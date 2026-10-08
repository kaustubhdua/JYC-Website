-- V58.0.4: the album publication guard is trigger-only and must not be directly callable.
revoke execute on function public.jyc_guard_media_album_publication() from public, anon, authenticated;
