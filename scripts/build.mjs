import {cp,mkdir,readFile,rm,readdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const dist=join(root,'dist');
// Local modules and relative resource URLs work at / or any GitHub Pages subpath.
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await cp(join(root,'public'),dist,{recursive:true});
await cp(join(root,'src'),join(dist,'src'),{recursive:true});
await cp(join(root,'index.html'),join(dist,'index.html'));
await writeFile(join(dist,'.nojekyll'),'');
const walk=async path=>{const out=[];for(const item of await readdir(path,{withFileTypes:true})){const full=join(path,item.name);if(item.isDirectory())out.push(...await walk(full));else out.push(full);}return out;};
const files=await walk(dist);
for(const file of files.filter(x=>x.endsWith('.js')))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const html=await readFile(join(dist,'index.html'),'utf8');
if(/(?:href|src)=["']\/(?!\/)/.test(html))throw new Error('Root-relative asset would break a Pages project subpath.');
if(!html.includes('WELCOME TO CLASS 2603.'))throw new Error('Missing film ending.');
console.log(`Built ${files.length} local files. No runtime CDN or API required.`);
