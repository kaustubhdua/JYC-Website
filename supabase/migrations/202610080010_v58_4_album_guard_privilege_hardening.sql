-- V58.0.4: remove the default PostgREST EXECUTE grant from the media album guard.
revoke execute on function public.jyc_guard_media_album_publication() from anon;
revoke execute on function public.jyc_guard_media_album_publication() from public;
revoke execute on function public.jyc_guard_media_album_publication() from authenticated;;