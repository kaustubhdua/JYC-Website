import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const dir=path.join(root,'supabase','migrations');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql'));
const guard=fs.readFileSync(path.join(dir,'202610060001_jyc_128_event_scope.sql'),'utf8');
const failures=[];
if(!guard.includes('JYC public events are restricted to JIIT Sector 128')) failures.push('publication guard missing');
if(!guard.includes('trg_jyc_event_campus_scope')) failures.push('database trigger missing');
if(!guard.includes('JIIT Wish Town Campus · Sector 128, Noida')) failures.push('canonical 128 venue missing');
for(const file of files){
  if(file==='202610060001_jyc_128_event_scope.sql'||file.includes('campus_verification')) continue;
  const text=fs.readFileSync(path.join(dir,file),'utf8');
  if(/jyc_events/i.test(text) && /venue[^\n]{0,160}(sector[- ]?62)/i.test(text)) failures.push(file+': event seed contains Sector 62');
}
if(failures.length){failures.forEach(x=>console.error('FAIL:',x));process.exit(1);}
console.log('PASS: JYC event campus scope is locked to Sector 128');
