/* Execute the production service worker in a mocked worker environment, without network. */
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const listeners = {};
const scope = 'https://example.invalid/kids-paint/';
const states = {offline:false};
const db=new Map();
class Cache {
 constructor() {this.records=new Map()}
 async addAll(reqs){for(const req of reqs){const x=await mockFetch(req); if(!x.ok)throw new Error('precache failed');this.records.set(req.url,x)}}
 async match(req,opts={}) {
  const key=typeof req==='string'?req:req.url;
  if(this.records.has(key))return this.records.get(key);
  if(opts.ignoreSearch){const noquery=x=>new URL(x).origin+new URL(x).pathname;for(const [k,v] of this.records){if(noquery(k)===noquery(key))return v}}
  return undefined;
 }
 async put(req,response){this.records.set(typeof req==='string'?req:req.url,response)}
}
const mockFetch=async req=>{if(states.offline)throw new Error('network unavailable');return {ok:true,type:'basic',clone(){return this},source:typeof req==='string'?req:req.url}};
const cacheApi={open:async name=>(db.has(name)||db.set(name,new Cache()),db.get(name)),keys:async()=>[...db.keys()],delete:async name=>db.delete(name)};
const self={registration:{scope},location:{origin:new URL(scope).origin},addEventListener:(t,fn)=>{listeners[t]=fn},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
const context={self,URL,Request,Response,caches:cacheApi,fetch:mockFetch,console};
vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
function event(type,request){let job;const e={request,waitUntil(p){job=p},respondWith(p){job=p}};listeners[type](e);return job}
(async()=>{
 await event('install');
 assert(db.has('kids-paint-shell-v4.5.0'));
 const cache=db.get('kids-paint-shell-v4.5.0');
 for(const item of ['','index.html','manifest.webmanifest','style.css?v=4.5.0','drawing.js?v=4.5.0','color-lab.html','color-lab.css?v=4.5.0','color-lab-core.js?v=4.5.0','color-lab.js?v=4.5.0','vendor/spectral.min.js?v=3.0.0','THIRD_PARTY_NOTICES.md','licenses/spectral-MIT.txt','assets/icon-192.png','assets/icon-512.png']){
  assert(await cache.match(scope+item), `Missing ${item}`);
 }
 const versionReq={url:scope+'version.json?check=123',method:'GET',mode:'cors'};
 const versionResult=await event('fetch',versionReq);
 assert(versionResult && versionResult.ok && versionResult.source===versionReq.url,'Version metadata fetched from network');
 assert(!(await cache.match(versionReq)),'Version metadata never cached in offline shell');
 // Online navigation of Color Lab must not overwrite the cached drawing home page.
 const homeBefore=await cache.match(scope);
 const onlineLabReq={url:scope+'color-lab.html',method:'GET',mode:'navigate'};
 assert((await event('fetch',onlineLabReq)).ok,'Online Color Lab navigation');
 const homeAfter=await cache.match(scope);
 assert(homeAfter && homeAfter.source===homeBefore.source,'Color Lab navigation cannot overwrite home cache');
 db.set('unrelated-cache',new Cache());
 db.set('kids-paint-shell-older',new Cache());await event('activate');assert(!db.has('kids-paint-shell-older'));
 assert(db.has('unrelated-cache'),'Non-shell storage kept');

 states.offline=true;
 await assert.rejects(event('fetch',versionReq),/network unavailable/,'Offline version checks fail instead of serving stale data');
 const nav={url:scope+'?source=pwa',method:'GET',mode:'navigate'};
 const output=await event('fetch',nav);assert(output && output.ok, 'Offline navigation fallback');
 const labNav={url:scope+'color-lab.html',method:'GET',mode:'navigate'};
 const labOffline=await event('fetch',labNav);
 assert(labOffline && labOffline.ok,'Color Lab loads offline via precache');
 assert(labOffline.source===scope+'color-lab.html','Offline Color Lab must load its own HTML');
 const homeOffline=await event('fetch',{url:scope,method:'GET',mode:'navigate'});
 assert(homeOffline && homeOffline.source===scope,'Offline home must show drawing HTML, not Color Lab');
 const vendorAsset={url:scope+'vendor/spectral.min.js?v=3.0.0',method:'GET',mode:'cors'};
 assert((await event('fetch',vendorAsset)).ok,'Pigment library loads offline');
 const css={url:scope+'style.css?v=4.5.0',method:'GET',mode:'cors'};
 assert((await event('fetch',css)).ok,'Offline static asset');
 assert(!event('fetch',{url:'https://example.invalid/other',method:'GET',mode:'cors'}),'SW respects scope');
 console.log('PASS: offline navigation, precache assets, scope isolation, activation cleanup');
})().catch(e=>{console.error(e);process.exit(1)});
