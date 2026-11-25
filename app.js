import {folders,projects,experiments,asset} from './content.js';
const select = selector => document.querySelector(selector);
const work = select('#work-content');
const categories = select('.categories');
const folderBar = select('.folders');
const viewer = select('#viewer');
let folder = folders[0].id;
let category = projects[0].category;
let returnFocus;

function button(text, handler) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  element.addEventListener('click',handler);
  return element;
}

const folderButtons = folders.map(item => {
  const element = button(item.title, () => { if(folder !== item.id){folder = item.id; renderWork();} });
  folderBar.append(element);
  return [item.id,element];
});

const categoryButtons = [...new Set(projects.map(project=>project.category))].map(name => {
  const element = button(name, () => { if(category !== name){category = name; renderWork();} });
  categories.append(element);
  return [name,element];
});

function renderWork() {
  const current = folders.find(item => item.id === folder);
  select('#path').textContent = '~/studio/' + folder;
  categories.hidden = folder !== 'projects';
  folderButtons.forEach(([id,element]) => element.setAttribute('aria-pressed',id === folder));
  categoryButtons.forEach(([name,element]) => element.setAttribute('aria-pressed',name === category));
  if (categories.hidden) {
    work.innerHTML = '<article class="panel tab-info"><h3>' + current.heading + '</h3><ul>' +
      current.notes.map(note=>'<li>'+note+'</li>').join('') + '</ul></article>';
    return;
  }
  work.innerHTML = projects.filter(project=>project.category === category).map(project => 
    '<article class="project panel"><button class="project-image" aria-label="查看 '+project.name+'"><img src="'+asset(project.cover)+'" alt="'+project.name+' 示例图片"></button><div><small>概念项目 · 示例</small><h3>'+project.name+'</h3><p>'+project.summary+'</p><button class="detail">查看详情</button></div></article>'
  ).join('');
  projects.filter(project=>project.category === category).forEach((project,index)=>{
    work.children[index].querySelectorAll('button').forEach(element => element.addEventListener('click',()=>openProject(project)));
  });
}

function openViewer(html) {
  if (viewer.open) return;
  returnFocus = document.activeElement;
  select('#viewer-content').innerHTML = html;
  viewer.showModal();
  viewer.scrollTop = 0;
  select('.close').focus();
}

function openProject(project) {
  openViewer('<h2 id="viewer-title">'+project.name+'</h2><p>'+project.summary+'</p><img src="'+asset(project.cover)+'" alt="项目封面"><p>项目过程为占位示例。</p>' +
    project.stages.map(stage=>'<figure><img loading="lazy" src="'+asset(stage.image)+'" alt="'+stage.name+'示例"><figcaption><strong>'+stage.name+'</strong> · '+stage.summary+'</figcaption></figure>').join(''));
}

select('.close').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
viewer.addEventListener('click',event=>{
  if(event.target !== viewer) return;
  const bounds = viewer.getBoundingClientRect();
  if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
});

const pinboard = select('.pinboard');
experiments.forEach(([image,title,x,y,width,angle,ratio])=>{
  const print = button('',()=>openViewer('<h2 id="viewer-title">'+title+'</h2><img src="'+asset(image)+'" alt="'+title+'示例"><p>创意实验 · 示例素材</p>'));
  print.className = 'print';
  const values = {x:x+'%',y:y+'%',w:width+'%',angle:angle+'deg',ratio};
  for(const [name,value] of Object.entries(values)) print.style.setProperty('--'+name,value);
  print.innerHTML = '<img loading="lazy" src="'+asset(image)+'" alt=""><span>'+title+'</span>';
  pinboard.append(print);
});
document.querySelectorAll('[data-art]').forEach(element => element.style.setProperty('--asset','url("'+asset(element.dataset.art)+'")'));

function markNavigation() {
  document.querySelectorAll('.bar nav a').forEach(link => {
    if (link.hash === location.hash) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('hashchange',markNavigation);
select('.folder').addEventListener('click',()=>{
  if(folder !== 'projects'){folder='projects';renderWork();}
  if(location.hash !== '#work') location.hash = 'work';
  else select('#work').scrollIntoView();
});
const note = select('.desk-note');
const props = [...document.querySelectorAll('[data-object]')];
function setNote(active) {
  props.forEach(element=>element.setAttribute('aria-expanded',element===active));
  note.hidden = !active;
  note.textContent = active?.dataset.object === 'ticket' ? '工作室记录 · 材料与原型观察' : '工作室歌单 · 链接待替换';
}
props.forEach(element=>element.addEventListener('click',()=>setNote(element.getAttribute('aria-expanded')==='true'?null:element)));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && !viewer.open && !note.hidden) setNote(null);});
document.addEventListener('click',event=>{if(!note.hidden&&!event.target.closest('[data-object],.desk-note')) setNote(null);});
renderWork();
markNavigation();
