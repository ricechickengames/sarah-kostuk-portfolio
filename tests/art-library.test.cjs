const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {compileArtLibrary}=require('../art-library.cjs');
test('art compiler emits files and a small manifest without embedded uploads',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'art-library-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const source=path.join(root,'media.json'),out=path.join(root,'dist');
 fs.writeFileSync(source,JSON.stringify({items:[{name:'new image.png',data:Buffer.from('image bytes').toString('base64'),alt:'My painting'},{src:'/assets/artwork/pond.jpg',alt:'Pond'}]}));
 const result=compileArtLibrary(source,out);assert.equal(result.length,2);assert.equal(fs.readFileSync(path.join(out,result[0].src.slice(1)),'utf8'),'image bytes');assert.ok(!fs.readFileSync(path.join(out,'content/art-media.json'),'utf8').includes('data'));assert.equal(result[1].src,'/assets/artwork/pond.jpg');
 for(const item of [{name:'bad.html',data:'YQ=='},{src:'/assets/../secret.png'},{src:'javascript:alert(1)'},{name:'bad.png',data:'%%%='}]){fs.writeFileSync(source,JSON.stringify({items:[item]}));assert.throws(()=>compileArtLibrary(source,out))}
 fs.writeFileSync(source,'{"items":[]}');assert.deepEqual(compileArtLibrary(source,out),[]);
});
