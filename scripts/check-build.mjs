import http from 'node:http';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff':'font/woff','.svg':'image/svg+xml','.txt':'text/plain'};
let base='/';
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(!pathname.startsWith(base)){res.writeHead(404).end();return;}
    const file=resolve(root,decodeURIComponent(pathname.slice(base.length))||'index.html');
    if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'}).end(bytes);
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
try{
 for(const prefix of ['/','/dear-mr-zou/']){
  base=prefix;const queue=[new URL(prefix,origin).href],seen=new Set();let bytes=0;
  while(queue.length){
   const url=queue.shift();if(seen.has(url))continue;seen.add(url);
   const response=await fetch(url);assert.equal(response.status,200,`Resource failed under ${prefix}: ${url}`);
   const body=await response.arrayBuffer();bytes+=body.byteLength;
   const path=new URL(url).pathname;
   if(path.endsWith('.woff')){assert.match(response.headers.get('content-type'),/font\/woff/);continue;}
   const text=new TextDecoder().decode(body);const refs=[];
   if(path.endsWith('/')||path.endsWith('.html'))refs.push(...[...text.matchAll(/(?:href|src)="(\.\/[^\"]+)"/g)].map(x=>x[1]));
   if(path.endsWith('.css'))refs.push(...[...text.matchAll(/url\(['"]?(\.\.\/[^)'" ]+)/g)].map(x=>x[1]));
   if(path.endsWith('.js'))refs.push(...[...text.matchAll(/from ['"](\.[^'"]+)['"]/g)].map(x=>x[1]));
   for(const ref of refs){const next=new URL(ref,url);assert.equal(next.origin,origin,'Unexpected external runtime dependency');assert.ok(next.pathname.startsWith(prefix),'Resource escaped project base');queue.push(next.href);}
  }
  console.log(`PASS ${prefix}: ${seen.size} resources served with HTTP 200 (${bytes.toLocaleString()} bytes).`);
 }
 const {size}=await stat(resolve(root,'assets/ProposalDisplay.woff'));assert.ok(size>1000,'Display font missing');
}finally{await new Promise(resolve=>server.close(resolve));}
