import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const sourceArchivePruner=()=>({
  name:'jyc-production-media-boundary',
  apply:'build',
  async writeBundle(){
    const root=process.cwd();
    const publicArchive=path.join(root,'public','assets','source-archive');
    const outArchive=path.join(root,'dist','assets','source-archive');
    if(!fs.existsSync(publicArchive)||!fs.existsSync(outArchive)) return;
    const media=await import('./src/jyc-source-media.js');
    const keep=new Set([
      ...media.JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.map(item=>String(item?.url||'').replace(/^\/assets\//,'')),
      ...media.JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.map(item=>String(item?.url||'').replace(/^\/assets\//,''))
    ].filter(Boolean));
    const keepFiles=[...keep];
    fs.rmSync(outArchive,{recursive:true,force:true});
    for(const relative of keepFiles){
      const source=path.join(root,'public','assets',relative);
      const target=path.join(root,'dist','assets',relative);
      if(!fs.existsSync(source)) continue;
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.copyFileSync(source,target);
    }
    const marker=path.join(root,'dist','production-media-boundary.json');
    fs.writeFileSync(marker,JSON.stringify({version:1,generatedAt:new Date().toISOString(),photoCount:media.JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.length,identityCount:media.JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.length,servedArchiveFiles:keepFiles.length},null,2)+'\\n');
    console.log('Production media boundary: served '+keepFiles.length+' curated source-archive files; raw archive is excluded from dist.');
  }
});

export default defineConfig({
  plugins: [react(),sourceArchivePruner()],
  build: {
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules\/react(?:-dom)?\//,
              priority: 30
            },
            {
              name: 'router-vendor',
              test: /node_modules\/react-router-dom\//,
              priority: 25
            },
            {
              name: 'supabase-vendor',
              test: /node_modules\/@supabase\//,
              priority: 25
            },
            {
              name: 'falcon-vendor',
              test: /node_modules\/three\//,
              priority: 25
            },
            {
              name: 'jyc-archive-data',
              test: /src\/(?:source-archive-index|jyc-source-archive|jyc-source-media)\.js$/,
              priority: 35
            },
            {
              name: 'vendor',
              test: /node_modules\//,
              priority: 10,
              minSize: 20000
            }
          ]
        }
      }
    }
  }
});
