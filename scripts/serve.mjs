import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const relative=decodeURIComponent(url.pathname).replace(/^\/+/,'');
  let path=resolve(root,relative||'index.html');
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');}
});
const port=Number(process.env.PORT||4173);server.listen(port,'0.0.0.0',()=>console.log(`Film ready on port ${port}`));
