const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const allowed=/\.(png|jpe?g|webp|gif|avif|mp4|webm)$/i;
function compileArtLibrary(source,output){
 if(!fs.existsSync(source))return;
 const {items}=JSON.parse(fs.readFileSync(source,'utf8'));
 if(!Array.isArray(items)||items.length>250)throw Error('Art media must contain at most 250 items');
 let total=0;
 const published=items.map(item=>{
  let src=item.src;
  if(item.data){
   if(!allowed.test(item.name||'')||!/^[A-Za-z0-9+/]*={0,2}$/.test(item.data)||item.data.length%4)throw Error('Invalid art media file');
   const bytes=Buffer.from(item.data,'base64');total+=bytes.length;
   if(bytes.length>25*1024*1024||total>40*1024*1024)throw Error('Art uploads exceed 25 MB per file or 40 MB total');
   const name=path.basename(item.name).replace(/[^a-zA-Z0-9._-]/g,'-');
   src='/assets/art-library/'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16)+'-'+name;
   const target=path.join(output,src.slice(1));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  }
  if(typeof src!=='string'||!allowed.test(src.split(/[?#]/)[0])||!(/^(?:https?:\/\/|\/assets\/)/.test(src))||/\\|(?:^|\/)\.\.(?:\/|$)|%2e/i.test(src))throw Error('Invalid art media source');
  return {src,type:/\.(mp4|webm)(?:[?#]|$)/i.test(src)?'video':'image',alt:String(item.alt||item.label||item.name||'Artwork'),...(item.poster?{poster:item.poster}:{}),...(item.caption?{caption:item.caption}:{})};
 });
 fs.mkdirSync(path.join(output,'content'),{recursive:true});fs.writeFileSync(path.join(output,'content/art-media.json'),JSON.stringify(published));
 return published;
}
module.exports={compileArtLibrary};
