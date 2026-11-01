const http = require('node:http'), fs = require('node:fs'), path = require('node:path')
const root = path.resolve(process.env.ADVENT_WORKER_BUILD || '/private/tmp/hatcast-advent-build/browser')
const mime = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css', '.webmanifest':'application/manifest+json' }
http.createServer((req,res)=>{
  if (req.url.startsWith('/v1/') || req.url.startsWith('/actuator/')) {
    const p = http.request({hostname:'127.0.0.1',port:18080,path:req.url,method:req.method,headers:req.headers}, r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)})
    p.on('error',()=>{res.writeHead(502);res.end()});req.pipe(p);return
  }
  const pathname=new URL(req.url,'http://127.0.0.1').pathname
  let target=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname))
  if (!target.startsWith(root+'/')) {res.writeHead(400);res.end();return}
  if (!fs.existsSync(target)||fs.statSync(target).isDirectory()) target=path.join(root,'index.html')
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'})
  fs.createReadStream(target).pipe(res)
}).listen(14331,'127.0.0.1',()=>console.log('Isolated frontend on 127.0.0.1:14331'))
