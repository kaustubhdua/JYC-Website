do $migration$
declare
  def text;
  old_fragment text := $$'sourceUrl',g.source_url,'credit',g.credit,'focalX',g.focal_x,'focalY',g.focal_y,'published',true$$;
  new_fragment text := $$'sourceUrl',g.source_url,'credit',g.credit,
          'title',g.title,'story',g.story,'subjects',g.subjects,'location',g.location,
          'capturedAt',g.captured_at,'capturedAtPrecision',g.captured_at_precision,
          'orientation',g.orientation,'width',g.width,'height',g.height,'aspectRatio',g.aspect_ratio,
          'technicalQuality',g.technical_quality,'compositionScore',g.composition_score,
          'peopleMomentScore',g.people_moment_score,'jycRelevanceScore',g.jyc_relevance_score,
          'uniquenessScore',g.uniqueness_score,'storyValueScore',g.story_value_score,
          'editorialScore',g.editorial_score,'editorialStatus',g.editorial_status,
          'featured',g.featured,'heroEligible',g.hero_eligible,'archiveEligible',g.archive_eligible,
          'duplicateGroup',g.duplicate_group,'sourceHash',g.source_hash,
          'derivativeStatus',g.derivative_status,'masterStoragePath',g.master_storage_path,
          'albumId',g.album_id,'albumName',(select a.name from public.jyc_media_albums a where a.id=g.album_id),
          'focalX',g.focal_x,'focalY',g.focal_y,'published',true$$;
begin
  select pg_get_functiondef(p.oid)
    into def
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='jyc_read_site_data'
    and pg_get_function_identity_arguments(p.oid)='';
  if def is null then raise exception 'jyc_read_site_data() not found'; end if;
  if position(old_fragment in def)=0 then raise exception 'gallery metadata fragment not found; refusing to mutate read RPC'; end if;
  def := replace(def,old_fragment,new_fragment);
  execute def;
end
$migration$;
