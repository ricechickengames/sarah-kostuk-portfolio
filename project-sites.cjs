const fs = require('node:fs');
const path = require('node:path');
const extensions = new Set(['html','htm','css','js','mjs','json','txt','png','jpg','jpeg','gif','webp','avif','svg','ico','woff','woff2','ttf','otf','eot','pdf','mp3','wav','ogg','mp4','webm']);
function validPath(name) {
  return typeof name === 'string' && name.length < 240 && name.split('/').every(part => part && !part.startsWith('.') && !/[<>:"\\|?*\x00-\x1f%#]/.test(part)) && extensions.has(name.split('.').pop().toLowerCase());
}
function validateBundle(bundle) {
  if (!bundle || !Array.isArray(bundle.files) || !bundle.files.length || bundle.files.length > 250) throw Error('Choose a website folder with 1–250 files.');
  const seen = new Set(); let total = 0;
  for (const file of bundle.files) {
    if (!validPath(file.path) || seen.has(file.path.toLowerCase())) throw Error('Invalid or duplicate project file path.');
    seen.add(file.path.toLowerCase());
    if (typeof file.data !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.data)) throw Error('Invalid project file encoding.');
    total += Buffer.byteLength(file.data, 'base64');
    if (total > 20 * 1024 * 1024) throw Error('Website folders must be smaller than 20 MB.');
  }
  if (!/\.html?$/i.test(bundle.startPage || '') || !bundle.files.some(file => file.path === bundle.startPage)) throw Error('Choose an HTML starting page from this folder.');
}
function compileProjectSites(source, output) {
  const manifest = [];
  if (fs.existsSync(source)) for (const name of fs.readdirSync(source).filter(name => name.endsWith('.json')).sort()) {
    const slug = name.slice(0, -5);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw Error('Invalid website project slug.');
    const project = JSON.parse(fs.readFileSync(path.join(source, name), 'utf8'));
    validateBundle(project.website);
    const prefix = `/web-projects/${slug}/`;
    for (const file of project.website.files) {
      let data = Buffer.from(file.data, 'base64');
      // Root-relative static assets should stay inside the uploaded website.
      if (/\.html?$/i.test(file.path)) data = Buffer.from(data.toString('utf8').replace(/(\b(?:href|src|action|poster|formaction)\s*=\s*["'])\/(?!\/)/gi, `$1${prefix}`));
      if (/\.css$/i.test(file.path)) data = Buffer.from(data.toString('utf8').replace(/(url\(\s*["']?)\/(?!\/)/gi, `$1${prefix}`));
      const destination = path.join(output, 'web-projects', slug, ...file.path.split('/'));
      fs.mkdirSync(path.dirname(destination), {recursive:true}); fs.writeFileSync(destination, data);
    }
    manifest.push({title:project.title || slug, description:project.description || '', url:prefix + project.website.startPage.split('/').map(encodeURIComponent).join('/'), hosted:true});
  }
  fs.mkdirSync(path.join(output, 'content'), {recursive:true});
  fs.writeFileSync(path.join(output, 'content', 'web-projects.json'), JSON.stringify(manifest));
  return manifest;
}
module.exports = {validPath, validateBundle, compileProjectSites};
