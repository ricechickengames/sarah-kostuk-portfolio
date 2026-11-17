// Store each website in its own CMS entry; the build publishes its directory intact.
(()=>{
  const h=window.h||window.React.createElement;
  const allowed=/\.(html?|css|m?js|json|txt|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|pdf|mp3|wav|ogg|mp4|webm)$/i;
  const plain=value=>value?.toJS?value.toJS():value;
  const Control=window.createClass({
    getInitialState(){return {status:'',busy:false}},
    async chooseFolder(event){
      const input=event.target,selected=Array.from(input.files||[]);if(!selected.length)return;
      this.setState({busy:true,status:'Preparing your website folder…'});
      try{
        const candidates=selected.map(file=>({file,path:(file.webkitRelativePath||file.name).split('/').slice(1).join('/')})).filter(({path})=>path&&!path.split('/').some(part=>part.startsWith('.')));
        const invalid=candidates.find(({path})=>!allowed.test(path)||/[<>:"\\|?*\x00-\x1f%#]/.test(path));
        if(invalid)throw Error(`Unsupported website file: ${invalid.path}. Upload the built HTML/CSS/JS site without dependencies or source tooling.`);
        if(candidates.length>250)throw Error('Choose a folder with no more than 250 files.');
        if(candidates.reduce((sum,{file})=>sum+file.size,0)>20*1024*1024)throw Error('Choose a folder smaller than 20 MB.');
        const html=candidates.filter(({path})=>/\.html?$/i.test(path)).map(({path})=>path).sort();
        if(!html.length)throw Error('This folder needs at least one HTML page.');
        const files=[];for(const {file,path} of candidates){const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error(`Could not read ${path}`));reader.readAsDataURL(file)});files.push({path,data})}
        const previous=plain(this.props.value);
        this.props.onChange({folderName:selected[0].webkitRelativePath.split('/')[0],startPage:html.includes(previous?.startPage)?previous.startPage:html.includes('index.html')?'index.html':html[0],files});
        this.setState({status:`${files.length} files ready. Choose the starting page, then Publish.`});
      }catch(error){this.setState({status:error.message})}finally{this.setState({busy:false});input.value=''}
    },
    isValid(){const value=plain(this.props.value);return value?.files?.some(file=>file.path===value.startPage)&&/\.html?$/i.test(value.startPage)?true:'Upload a website folder and choose its HTML starting page.'},
    render(){const value=plain(this.props.value),pages=(value?.files||[]).filter(file=>/\.html?$/i.test(file.path));return h('div',{className:this.props.classNameWrapper},
      h('label',{htmlFor:this.props.forID+'-folder',style:{display:'block',marginBottom:8}},'Upload website folder'),
      h('input',{id:this.props.forID+'-folder',type:'file',webkitdirectory:'',directory:'',multiple:true,disabled:this.state.busy,onChange:this.chooseFolder}),
      h('p',{style:{fontSize:13}},'Select the whole folder containing HTML, CSS, JavaScript, images and fonts. Maximum 250 files / 20 MB. Server-side code is not supported.'),
      value?h('div',null,h('p',null,`${value.folderName||'Website'} · ${value.files?.length||0} files`),h('label',{htmlFor:this.props.forID},'Starting page'),h('select',{id:this.props.forID,value:value.startPage,onChange:event=>this.props.onChange({...value,startPage:event.target.value}),style:{display:'block',padding:10,width:'100%',marginTop:8}},...pages.map(file=>h('option',{key:file.path,value:file.path},file.path)))):null,
      h('p',{role:'status',style:{fontSize:13}},this.state.status))}
  });
  CMS.registerWidget('websiteFolder',Control,({value})=>{const bundle=plain(value);return bundle?h('p',null,`${bundle.folderName}: ${bundle.startPage} (${bundle.files?.length||0} files)`):null});
})();
