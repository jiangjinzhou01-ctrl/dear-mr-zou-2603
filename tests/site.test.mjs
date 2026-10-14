import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';
import {render} from '../src/template.mjs';
import {facts,copy} from '../src/content.mjs';

// Headless logic fixture, not a browser or a layout emulator.
// Tests exercise the shipped app.js with touch/keyboard-equivalent click events.
class Element {
  constructor(name=''){this.name=name;this.dataset={};this.attrs={};this.hidden=false;this.disabled=false;this.textContent='';this.innerHTML='';this.events={};this.children={};this.classes=new Set();this.classList={add:(...v)=>v.forEach(x=>this.classes.add(x)),remove:(...v)=>v.forEach(x=>this.classes.delete(x)),contains:v=>this.classes.has(v),toggle:(v,on)=>{const active=on??!this.classes.has(v);active?this.classes.add(v):this.classes.delete(v);return active;}};}
  addEventListener(name,handler){(this.events[name]??=[]).push(handler);}
  async emit(name,event={}){for(const handler of this.events[name]||[])await handler({target:this,preventDefault(){},...event});}
  setAttribute(key,value){this.attrs[key]=String(value);}removeAttribute(key){delete this.attrs[key];}
  getAttribute(key){return this.attrs[key]??null;}
  querySelector(selector){return this.children[selector]??null;}
  querySelectorAll(selector){const result=this.children[selector];return Array.isArray(result)?result:result?[result]:[];}
  closest(){return this.parent;}focus(){this.focused=true;}scrollIntoView(options){this.scrolled=options;}
  contains(element){return element===this||element.parent===this;}
  replaceChildren(){this.items=[];}appendChild(element){(this.items??=[]).push(element);}
  showModal(){this.open=true;}close(){this.open=false;void this.emit('close');}
  getBoundingClientRect(){return {left:10,right:100,top:10,bottom:100};}
}
const source=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
function fixture({storageBlocked=false,reduced=true}={}) {
  const single={},many={},scheduled=new Map(),window=new Element('window'),document=new Element('document');
  document.documentElement=new Element('html');document.body=new Element('body');
  document.createElement=()=>new Element('span');window.PROPOSAL_COPY=copy;
  const node=selector=>single[selector]??=(new Element(selector));
  const ids=['announcer','sound-toggle','sound-label','language-toggle','open-proposal','conversation-next','conversation-next-label','hello-message','begin-chapter','begin-status','chapter-toggle','chapter-menu','replay'];ids.forEach(id=>node('#'+id));
  ['.language-current','.language-other','.wordmark','.annotation-trigger','.reader-counter'].forEach(node);
  node('#chapter-menu').hidden=true;node('#hello-message').hidden=true;
  const chapters=['document','who','human','conversation','proposal','beginning'].map((id,i)=>{const c=node('#'+id);c.dataset.chapter=String(i);c.children[`#${id} h1, #${id} h2`]=new Element(id+' title');single[`#${id} h1, #${id} h2`]=c.children[`#${id} h1, #${id} h2`];return c;});
  many['.chapter']=chapters;many['.reveal']=[];
  const rows=[0,1,2].map(i=>{const row=new Element('revision'+i),button=new Element('button'+i),note=new Element('note'+i);note.hidden=true;button.parent=row;row.children['.revision-button']=button;row.children['.revision-note']=note;row.children['.revision-label']=new Element('label'+i);return row;});
  many['.revision-row']=rows;many['.revision-button']=rows.map(r=>r.children['.revision-button']);
  many['.conversation-line']=[0,1,2,3].map(i=>{const line=node(`[data-line="${i}"]`);line.hidden=i>0;return line;});
  const links=chapters.map(c=>{const l=new Element('link');l.hash='#'+c.name.slice(1);return l;});many['.chapter-link']=links;
  const progress=node('.chapter-progress');node('#chapter-toggle').parent=progress;node('#chapter-menu').parent=progress;
  const dialogs=['cover-dialog','small-dialog','future-dialog'].map(id=>{const d=node('#'+id),close=new Element('close');d.children['.dialog-close']=close;d.children['.dialog-close-list']=[close];d.querySelectorAll=()=>[close];return d;});
  many['.note-dialog']=dialogs;many['.dialog-top .dialog-close']=dialogs.map(d=>d.children['.dialog-close']);
  many['[data-dialog]']=dialogs.map(d=>{const b=new Element('trigger');b.dataset.dialog=d.name.slice(1);return b;});
  document.querySelector=selector=>single[selector]??null;document.querySelectorAll=selector=>many[selector]??[];document.getElementById=id=>single['#'+id];
  const media=new Element('media');media.matches=reduced;window.matchMedia=()=>media;
  let timer=0;const storage=new Map();
  const localStorage={getItem:key=>{if(storageBlocked)throw Error('blocked');return storage.get(key);},setItem:(key,value)=>{if(storageBlocked)throw Error('blocked');storage.set(key,value);}};
  vm.runInNewContext(source,{window,document,localStorage,setTimeout:(fn)=>{const id=++timer;scheduled.set(id,fn);return id;},clearTimeout:id=>scheduled.delete(id),console});
  const runTimers=()=>{for(const [id,fn] of [...scheduled]){scheduled.delete(id);fn();}};
  return {single,many,node,document,window,runTimers,scheduled};
}

test('six complete chapters, unique IDs, working anchors and dialog targets',()=>{
  const html=render();const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(new Set(ids).size,ids.length);assert.equal((html.match(/data-chapter="[0-5]"/g)||[]).length,6);
  for(const [,anchor] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(anchor),anchor);
  for(const [,target] of html.matchAll(/data-dialog="([^"]+)"/g))assert.ok(ids.includes(target),target);
  assert.equal(facts.futureEntries.length,0);
});
test('all editable text has Chinese and English, with no invented metrics',()=>{
  for(const [key,value] of Object.entries(copy)){assert.equal(value.length,2,key);assert.ok(value.every(x=>typeof x==='string'&&x.length>0),key);}
  assert.equal(facts.className,'2603');assert.equal(facts.subject,'商务英语');
});
test('deployment resources exist and work from a GitHub repository subpath',async()=>{
  const html=render(),css=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
  const paths=[...[...html.matchAll(/(?:href|src)="(\.\/[^"#]+)"/g)].map(x=>x[1]),...[...css.matchAll(/url\('(\.\/[^']+)'\)/g)].map(x=>x[1])];
  for(const path of paths){const expected=path==='./styles.css'?'../src/styles.css':path==='./app.js'?'../src/app.js':'../public/'+path.slice(2);assert.ok((await stat(new URL(expected,import.meta.url))).size>0,path);assert.ok(new URL(path,'https://example.github.io/dear-mr-zou/').pathname.startsWith('/dear-mr-zou/'));}
  assert.ok(!/https?:\/\//.test(source),'no runtime network calls');
});
test('opening transitions into chapter 01 in reduced motion mode',async()=>{
  const f=fixture();await f.node('#open-proposal').emit('click');assert.equal(f.node('#who').scrolled.block,'start');assert.equal(f.node('#open-proposal').disabled,false);
});
test('cinematic opening cleans up and preserves future replay',async()=>{
  const f=fixture({reduced:false});await f.node('#open-proposal').emit('click');assert.ok(f.document.documentElement.classList.contains('opening'));f.runTimers();assert.equal(f.node('#open-proposal').disabled,false);assert.ok(!f.document.documentElement.classList.contains('opening'));
});
test('all three terms can be revised and restored using click',async()=>{
  const f=fixture();for(const row of f.many['.revision-row']){const button=row.children['.revision-button'];await button.emit('click');assert.equal(button.attrs['aria-expanded'],'true');assert.equal(row.children['.revision-note'].hidden,false);await button.emit('click');assert.equal(row.children['.revision-note'].hidden,true);assert.equal(button.attrs['aria-expanded'],'false');}
});
test('four reader interactions reveal all lines and the greeting, then visit the proposal',async()=>{
  const f=fixture();for(let i=0;i<4;i++)await f.node('#conversation-next').emit('click');assert.ok(f.many['.conversation-line'].every(x=>!x.hidden));assert.equal(f.node('#hello-message').hidden,false);await f.node('#conversation-next').emit('click');assert.ok(f.node('#proposal').scrolled);
});
test('beginning is a complete ceremony, replay resets every narrative state',async()=>{
  const f=fixture();await f.many['.revision-button'][0].emit('click');await f.node('#conversation-next').emit('click');await f.node('#begin-chapter').emit('click');assert.equal(f.node('#begin-chapter').disabled,true);f.runTimers();assert.ok(f.node('#beginning').scrolled);assert.match(f.node('#begin-status').textContent,/已送达/);await f.node('#replay').emit('click');assert.equal(f.node('#begin-status').textContent,'');assert.equal(f.node('#begin-chapter').disabled,false);assert.equal(f.many['.conversation-line'][1].hidden,true);assert.equal(f.many['.revision-row'][0].children['.revision-note'].hidden,true);assert.ok(f.node('#document').scrolled);
});
test('language changes in place even when localStorage is blocked',async()=>{
  const f=fixture({storageBlocked:true});await f.node('#language-toggle').emit('click');assert.equal(f.document.documentElement.lang,'en');await f.node('#language-toggle').emit('click');assert.equal(f.document.documentElement.lang,'zh-CN');
});
test('chapter index closes via Escape and native dialogs open and close',async()=>{
  const f=fixture();await f.node('#chapter-toggle').emit('click');assert.equal(f.node('#chapter-menu').hidden,false);await f.document.emit('keydown',{key:'Escape'});assert.equal(f.node('#chapter-menu').hidden,true);for(let i=0;i<3;i++){await f.many['[data-dialog]'][i].emit('click');const dialog=f.many['.note-dialog'][i];assert.equal(dialog.open,true);await dialog.children['.dialog-close'].emit('click');assert.equal(dialog.open,false);}
});
test('unsupported audio returns a readable message without enabling sound',async()=>{
  const f=fixture();await f.node('#sound-toggle').emit('click');assert.equal(f.node('#sound-toggle').attrs['aria-pressed'],'false');assert.equal(f.node('#sound-toggle').disabled,false);assert.ok(f.node('#announcer').textContent.includes('声音'));
});
test('responsive and reduced-motion fallbacks are explicitly present',async()=>{
  const css=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');for(const breakpoint of ['max-width:767px','max-width:359px','max-width:1023px','min-width:1800px'])assert.ok(css.includes(breakpoint));assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.ok(css.includes('safe-area-inset-bottom'));assert.ok(!css.includes('overflow:hidden}body'));assert.ok(!source.includes("addEventListener('scroll'"));
});
