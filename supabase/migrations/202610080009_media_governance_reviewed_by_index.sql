-- V58.0.3: cover the reviewer foreign key introduced by media governance.
-- This removes the remaining unindexed FK warning without changing public behavior.
create index if not exists jyc_gallery_reviewed_by_idx on public.jyc_gallery_items(reviewed_by);
