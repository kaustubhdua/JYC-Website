-- V56.7 — seed the source-backed JYC team into the canonical public JSON read model.
-- The supplied 2026–27 orientation material names the apex body, core committee heads and
-- faculty advisors. This migration only seeds the team layer when the canonical JSON has no team rows.
-- It does not overwrite a later editorially managed team.

do $migration$
declare
  seeded jsonb := jsonb_build_array(
    jsonb_build_object('id','devansh-tripathi','name','Devansh Tripathi','role','General Secretary','published',true,'sortOrder',1,'photo','/assets/team/devansh-tripathi.webp','bio','Listed in the supplied 2026–27 JYC orientation material as General Secretary of the student apex body.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','amrit-kumar-jha','name','Amrit Kumar Jha','role','Vice President','published',true,'sortOrder',2,'photo','/assets/team/amrit-kumar.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Vice President of the student apex body.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','saksham-kotia','name','Saksham Kotia','role','Joint Secretary','published',true,'sortOrder',3,'photo','/assets/team/saksham-kotia.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Joint Secretary.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','daksh-sachdeva','name','Daksh Sachdeva','role','Finance Secretary / Treasurer','published',true,'sortOrder',4,'photo','/assets/team/daksh-sachdeva.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Finance Secretary / Treasurer.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','aradhyaa-singh','name','Aradhyaa Singh','role','Executive Head','published',true,'sortOrder',10,'photo','/assets/team/aradhyaa-singh.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Executive Head of the JYC core committees.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','divye-bajaj','name','Divye Bajaj','role','PR Head','published',true,'sortOrder',11,'photo','/assets/team/divye-bajaj.webp','bio','Listed in the supplied 2026–27 JYC orientation material as PR Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','shriya-singh','name','Shriya Singh','role','Digital Head','published',true,'sortOrder',12,'photo','/assets/team/shriya-singh.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Digital Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','harisha','name','Harisha','role','Creative Head','published',true,'sortOrder',13,'photo','','bio','Listed in the supplied 2026–27 JYC orientation material as Creative Head of the JYC core committees.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','dhruv-choudhary','name','Dhruv Choudhary','role','Management Head','published',true,'sortOrder',14,'photo','','bio','Listed in the supplied 2026–27 JYC orientation material as Management Head of the JYC core committees.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','revant-srivastava','name','Revant Srivastava','role','Management Head','published',true,'sortOrder',15,'photo','/assets/team/revant-srivastava.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Management Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','juhi-hatuka','name','Juhi Hatuka','role','Hospitality Head','published',true,'sortOrder',16,'photo','/assets/team/juhi-hatuka.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Hospitality Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','asmi-srivastava','name','Asmi Srivastava','role','Hospitality Head','published',true,'sortOrder',17,'photo','/assets/team/asmi-srivastava.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Hospitality Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','vansh-mahajan','name','Vansh Mahajan','role','Security Head','published',true,'sortOrder',18,'photo','/assets/team/vansh-mahajan.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Security Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','pratik-kumar','name','Pratik Kumar','role','Security Head','published',true,'sortOrder',19,'photo','/assets/team/pratik-kumar.webp','bio','Listed in the supplied 2026–27 JYC orientation material as Security Head.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','faculty-vinay-anand-tikkiwal','name','Dr. Vinay Anand Tikkiwal','role','Faculty Advisor','published',true,'sortOrder',20,'photo','','bio','Listed in the supplied JYC orientation material as a Faculty Advisor.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material'),
    jsonb_build_object('id','faculty-pankaj-kumar-srivastava','name','Dr. Pankaj Kumar Srivastava','role','Faculty Advisor','published',true,'sortOrder',21,'photo','','bio','Listed in the supplied JYC orientation material as a Faculty Advisor.','sourceType','presentation-export','sourceLabel','JYC 2026–27 orientation material')
  );
begin
  update public.jyc_site_data
  set data=jsonb_set(data,'{team}',seeded,true)
  where id='main'
    and coalesce(jsonb_array_length(data->'team'),0)=0;
end;
$migration$;
