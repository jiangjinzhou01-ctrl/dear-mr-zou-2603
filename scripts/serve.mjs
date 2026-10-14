import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const root=fileURLToPath(new URL('../dist',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.otf':'font/otf','.txt':'text/plain; charset=utf-8'};
try{await stat(resolve(root,'index.html'));}catch{await import('./build.mjs');}
createServer(async(req,res)=>{try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,`.${path.endsWith('/')?path+'index.html':path}`);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('DEAR MR. ZOU ready on port '+(process.env.PORT||4173)));
