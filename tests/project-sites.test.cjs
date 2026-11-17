const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {validateBundle,compileProjectSites}=require('../project-sites.cjs');
const encoded=text=>Buffer.from(text).toString('base64');
test('website bundle rejects traversal, duplicates and missing start pages',()=>{
  const valid={startPage:'pages/start.html',files:[{path:'pages/start.html',data:encoded('<h1>Hi</h1>')}]};
  assert.doesNotThrow(()=>validateBundle(valid));
  for(const name of ['../index.html','/index.html','a/../../index.html','a\\index.html','.env','a/%2e%2e/index.html'])assert.throws(()=>validateBundle({startPage:name,files:[{path:name,data:encoded('x')}]}));
  assert.throws(()=>validateBundle({...valid,startPage:'missing.html'}));
  assert.throws(()=>validateBundle({...valid,files:[...valid.files,{...valid.files[0]}]}));
});
test('compiler keeps nested assets and selected entry point, with small public manifest',t=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-project-test-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
  const source=path.join(temp,'bundles'),output=path.join(temp,'dist');fs.mkdirSync(source);
  fs.writeFileSync(path.join(source,'demo.json'),JSON.stringify({title:'Demo',website:{startPage:'pages/start.html',files:[{path:'pages/start.html',data:encoded('<link href="/styles/main.css"><img src="../images/a.png">')},{path:'styles/main.css',data:encoded('body{background:url(/images/a.png)}')},{path:'images/a.png',data:encoded('image-data')}]}}));
  const manifest=compileProjectSites(source,output);
  assert.equal(manifest[0].url,'/web-projects/demo/pages/start.html');
  assert.match(fs.readFileSync(path.join(output,'web-projects/demo/pages/start.html'),'utf8'),/href="\/web-projects\/demo\/styles\/main.css"/);
  assert.match(fs.readFileSync(path.join(output,'web-projects/demo/styles/main.css'),'utf8'),/url\(\/web-projects\/demo\/images\/a.png\)/);
  assert.equal(fs.readFileSync(path.join(output,'web-projects/demo/images/a.png'),'utf8'),'image-data');
  assert.ok(!fs.readFileSync(path.join(output,'content/web-projects.json'),'utf8').includes('files'));
});
