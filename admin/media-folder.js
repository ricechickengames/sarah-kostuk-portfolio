(()=>{
 const h=window.h||window.React.createElement,plain=v=>v?.toJS?v.toJS():v;
 const allowed=/\.(png|jpe?g|webp|gif|avif|mp4|webm)$/i;
 const Control=window.createClass({
  getInitialState(){return {busy:false,status:''}},
  items(){return plain(this.props.value)||[]},
  async add(event){
   const input=event.target,files=Array.from(input.files||[]);if(!files.length)return;
   this.setState({busy:true,status:'Preparing media…'});
   try{
    const previous=this.items();if(previous.length+files.length>250)throw Error('Your gallery can hold up to 250 items.');
    if(files.some(f=>!allowed.test(f.name)))throw Error('Choose JPG, PNG, WebP, GIF, AVIF, MP4 or WebM files.');
    if(files.some(f=>f.size>25*1024*1024))throw Error('Each file must be smaller than 25 MB.');
    const bytes=previous.reduce((n,p)=>n+(p.data?.length||0)*3/4,0)+files.reduce((n,f)=>n+f.size,0);
    if(bytes>40*1024*1024)throw Error('New uploads must total less than 40 MB.');
    const added=[];for(const file of files){const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('Could not read '+file.name));r.readAsDataURL(file)});added.push({name:file.name,data,alt:file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),type:/\.(mp4|webm)$/i.test(file.name)?'video':'image'})}
    this.props.onChange([...previous,...added]);this.setState({status:`Added ${added.length} items. Publish to save your gallery.`});
   }catch(error){this.setState({status:error.message})}finally{input.value='';this.setState({busy:false})}
  },
  move(index,direction){const items=[...this.items()],next=index+direction;if(next<0||next>=items.length)return;[items[index],items[next]]=[items[next],items[index]];this.props.onChange(items)},
  render(){const items=this.items();return h('div',{className:this.props.classNameWrapper},
   h('p',null,'One collection for your Art page and its project folder previews. Add several files at once. Images keep their full proportions.'),
   h('label',{htmlFor:this.props.forID,style:{display:'block',fontWeight:600,margin:'12px 0'}},'Add images or videos'),
   h('input',{id:this.props.forID,type:'file',multiple:true,accept:'.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm',disabled:this.state.busy,onChange:this.add}),
   h('p',{style:{fontSize:12}},'Up to 25 MB per file; 40 MB of new uploads total. Publish when finished.'),
   h('p',{role:'status'},this.state.status||`${items.length} items in your art folder`),
   h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:16}},...items.map((item,index)=>{
    const video=item.type==='video'||/\.(mp4|webm)$/i.test(item.name||item.src||'');const src=item.data?`data:${video?'video/mp4':'image/'+((item.name||'').split('.').pop()||'jpeg')};base64,${item.data}`:item.src;
    return h('div',{key:index,style:{padding:8,background:'#f5f1ec',borderRadius:6}},h(video?'video':'img',{src:video?src:src,alt:item.alt||'Artwork',controls:video,preload:video?'none':undefined,poster:item.poster,style:{width:'100%',height:120,objectFit:'contain'}}),h('p',{style:{fontSize:12,overflowWrap:'anywhere'}},item.alt||item.name||'Artwork'),h('button',{type:'button',disabled:this.state.busy||index===0,onClick:()=>this.move(index,-1),'aria-label':`Move item ${index+1} earlier`},'←'),h('button',{type:'button',disabled:this.state.busy||index===items.length-1,onClick:()=>this.move(index,1),'aria-label':`Move item ${index+1} later`},'→'),h('button',{type:'button',disabled:this.state.busy,onClick:()=>this.props.onChange(items.filter((_,i)=>i!==index)),'aria-label':`Remove item ${index+1}`},'Remove'))
   })))
  }
 });
 CMS.registerWidget('mediaFolder',Control,({value})=>h('p',null,`${(plain(value)||[]).length} art media items`));
})();
