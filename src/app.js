import {initialState,documentReducer} from './state.mjs';
/* Native scroll stays native. CSS view timelines handle continuous motion;
   IntersectionObserver changes only discrete document states. */
const root=document.documentElement;
const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const copy=window.PROPOSAL_COPY||{};
const lang=()=>root.dataset.lang||'zh';
const t=(zh,en)=>lang()==='en'?en:zh;
const localized=key=>copy[key]?.[lang()==='en'?1:0]||key;
const announce=message=>{$('#announcer').textContent=message;};
const timers=new Set(),animations=new Set();
const later=(fn,delay)=>{const timer=setTimeout(()=>{timers.delete(timer);fn();},delay);timers.add(timer);return timer;};
let state=initialState(),activePage=0,dialogTrigger;
const dispatch=event=>{state=documentReducer(state,event);return state;};
const wishNodes=$$('.wish');
const wishHomes=wishNodes.map(node=>node.parentElement);
const printText=(element,key)=>{
  element.replaceChildren();
  ['zh','en'].forEach((language,i)=>{const span=document.createElement('span');span.className=`i18n lang-${language}`;span.lang=i?'en':'zh-CN';span.textContent=copy[key]?.[i]||key;element.appendChild(span);});
};
function focusHeading(id){const heading=$(`#${id} h1,#${id} h2`)||document.getElementById(id);heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
function visit(id){const target=document.getElementById(id);if(!target)return;target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});focusHeading(id);}
function setTimeline(){root.dataset.timeline=String(!reduced.matches&&!!window.CSS?.supports('animation-timeline: view()'));}
setTimeline();
reduced.addEventListener?.('change',()=>{setTimeline();if(reduced.matches){animations.forEach(a=>a.finish());}});

class Sound{
  constructor(){this.enabled=false;this.context=null;this.gain=null;this.oscillators=[];}
  async toggle(){
    if(this.enabled){this.enabled=false;this.gain.gain.setTargetAtTime(0,this.context.currentTime,.08);return false;}
    const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error('Audio unavailable');
    if(!this.context){this.context=new Context();this.gain=this.context.createGain();this.gain.gain.value=0;this.gain.connect(this.context.destination);[130.81,196].forEach(frequency=>{const oscillator=this.context.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency;oscillator.connect(this.gain);oscillator.start();this.oscillators.push(oscillator);});}
    await this.context.resume();if(this.context.state!=='running')throw Error('Audio paused');this.enabled=true;this.chapter(activePage);this.tick('open');return true;
  }
  chapter(page){if(!this.enabled)return;this.gain.gain.setTargetAtTime([.007,.007,.008,.012,.009,.006][page]||.006,this.context.currentTime,1.2);this.oscillators[1].frequency.setTargetAtTime(page>=3?174.61:196,this.context.currentTime,1.5);}
  tick(kind='paper'){
    if(!this.enabled||this.context.state!=='running')return;
    const context=this.context,gain=context.createGain(),now=context.currentTime;gain.connect(context.destination);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.02,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.22);
    if(kind==='paper'){const buffer=context.createBuffer(1,Math.floor(context.sampleRate*.22),context.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.25;const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=1100;source.connect(filter);filter.connect(gain);source.start(now);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
    else{const tone=context.createOscillator();tone.frequency.value=kind==='letter'?523.25:392;tone.connect(gain);tone.start(now);tone.stop(now+.24);tone.onended=()=>{tone.disconnect();gain.disconnect();};}
  }
  destroy(){this.oscillators.forEach(o=>o.stop());this.context?.close();}
}
const sound=new Sound();
function soundLabel(){const button=$('#sound-toggle');button.setAttribute('aria-pressed',String(sound.enabled));printText($('#sound-label'),sound.enabled?'soundOn':'soundOff');}
$('#sound-toggle').addEventListener('click',async()=>{const button=$('#sound-toggle');button.disabled=true;try{await sound.toggle();}catch{sound.enabled=false;announce(localized('soundUnavailable'));}finally{soundLabel();button.disabled=false;}});
document.addEventListener('visibilitychange',()=>{if(!sound.context||!sound.enabled)return;if(document.hidden)sound.context.suspend().catch(()=>{});else sound.context.resume().then(()=>sound.chapter(activePage)).catch(()=>{sound.enabled=false;soundLabel();});});

function paintRevisions(){
  const count=state.revisions.filter(Boolean).length;
  $$('.edited-word').forEach((node,i)=>{node.classList.toggle('is-revised',state.revisions[i]);$('.revision-term',node).setAttribute('aria-pressed',String(state.revisions[i]));});
  $$('.edit-note').forEach((node,i)=>{node.classList.toggle('is-active',state.revisions[i]);node.setAttribute('aria-hidden',String(!state.revisions[i]));});
  $('#human').classList.toggle('has-revisions',count>0);$('#human').classList.toggle('fully-revised',count===3);
  $('.draft-heading').setAttribute('aria-hidden',String(count===3));$('.revised-heading').setAttribute('aria-hidden',String(count!==3));
  $('.edit-stamp').textContent=count?t('2603 修订中','REVISED BY 2603'):'DRAFT FOR REVIEW';
  $('#revision-pass').value=String(count);$('#revision-pass').setAttribute('aria-valuetext',t(`已修订 ${count} 处，共 3 处`,`Revised ${count} of 3 phrases`));
  $('#revision-status').textContent=t(`${count} / 3 处已修订`,`${count} / 3 REVISIONS`);
  $('#restore-original').disabled=count===0;
}
function setLanguage(language,persist=true){
  root.dataset.lang=language;root.lang=language==='en'?'en':'zh-CN';
  $('.language-current').textContent=language==='en'?'EN':'中';$('.language-other').textContent=language==='en'?'中':'EN';
  $('#language-toggle').setAttribute('aria-label',t('Switch to English','切换为中文'));
  $('.wordmark').setAttribute('aria-label',t('DEAR MR. ZOU，返回封面','DEAR MR. ZOU, back to the cover'));
  $('.cover-note').setAttribute('aria-label',localized('coverNote'));$('#revision-pass').setAttribute('aria-label',localized('revisionRange'));
  $$('.note-head .dialog-close').forEach(button=>button.setAttribute('aria-label',localized('close')));
  document.title=t('DEAR MR. ZOU｜来自2603班的一份特别提案','DEAR MR. ZOU | The Living Document');
  if(state.letter!=='proposal')$('#begin-status').textContent=localized(state.letter==='ready'?'begun':'beginning');
  paintRevisions();if(persist)try{localStorage.setItem('dear-zou-language',language);}catch{}
}
try{setLanguage(localStorage.getItem('dear-zou-language')==='en'?'en':'zh',false);}catch{setLanguage('zh',false);}
$('#language-toggle').addEventListener('click',()=>{setLanguage(lang()==='en'?'zh':'en');sound.tick();});
$$('.revision-term').forEach(button=>button.addEventListener('click',()=>{dispatch({type:'REVISE',index:Number(button.dataset.revision)});paintRevisions();sound.tick();}));
$('#revision-pass').addEventListener('input',event=>{dispatch({type:'REVISION_PASS',value:event.target.value});paintRevisions();});
$('#revision-pass').addEventListener('change',()=>sound.tick());
$('#restore-original').addEventListener('click',()=>{dispatch({type:'REVISION_PASS',value:0});paintRevisions();sound.tick();announce(t('原稿已恢复。','Original wording restored.'));});

$('#open-proposal').addEventListener('click',()=>{
  const button=$('#open-proposal');if(button.disabled)return;button.disabled=true;dispatch({type:'OPEN'});$('#document').classList.add('is-open');sound.tick('open');
  const finish=()=>{$$('.cover-leaf').forEach(leaf=>{leaf.inert=true;});button.disabled=false;visit('who');announce(t('提案已展开。','The proposal is open.'));};
  if(reduced.matches)finish();else later(finish,1080);
});

// FLIP: record geometry, move the original text nodes, then animate their new
// layout backwards to the old positions. There is no duplicated letter copy.
function moveFrom(node,from,delay=0){
  if(reduced.matches||typeof node.animate!=='function')return null;
  const to=node.getBoundingClientRect();if(!to.width||!to.height)return null;
  const transform=`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`;
  const animation=node.animate([{transform,opacity:.6},{transform:'none',opacity:1}],{duration:1450,delay,easing:'cubic-bezier(.22,.72,.12,1)',fill:'both'});
  animations.add(animation);animation.finished.then(()=>{animations.delete(animation);animation.cancel();}).catch(()=>{animations.delete(animation);});return animation;
}
$('#begin-chapter').addEventListener('click',()=>{
  if(state.letter!=='proposal')return;dispatch({type:'MAKE_LETTER'});
  const button=$('#begin-chapter'),documentSheet=$('.invitation-document'),surface=$('.invitation-surface'),letter=$('.welcome-letter');
  button.disabled=true;button.setAttribute('aria-busy','true');$('#begin-status').textContent=localized('beginning');sound.tick('letter');
  const oldSurface=surface.getBoundingClientRect(),rects=wishNodes.map(node=>node.getBoundingClientRect());
  const scrollOffset=$('#proposal').getBoundingClientRect().top;
  letter.hidden=false;wishNodes.forEach(node=>$('#letter-body').appendChild(node));documentSheet.classList.add('is-letter');root.classList.add('letter-made');
  // The reader remains at the letter, rather than being sent straight to the end.
  if(scrollOffset<70)$('#proposal').scrollIntoView({behavior:'instant',block:'start'});
  moveFrom(surface,oldSurface);wishNodes.forEach((node,i)=>moveFrom(node,rects[i],i*65));
  if(!reduced.matches&&typeof letter.animate==='function'){
    const titleAnimation=$('#letter-title').animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:700,delay:800,fill:'both',easing:'cubic-bezier(.22,.72,.12,1)'});animations.add(titleAnimation);titleAnimation.finished.then(()=>{animations.delete(titleAnimation);titleAnimation.cancel();}).catch(()=>animations.delete(titleAnimation));
  }
  const ready=()=>{dispatch({type:'LETTER_READY'});button.removeAttribute('aria-busy');$('#begin-status').textContent=localized('begun');focusHeading('letter-title');announce(localized('begun'));};
  if(reduced.matches)ready();else later(ready,1700);
});

const toggle=$('#chapter-toggle'),menu=$('#chapter-menu');
const closeMenu=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');};
toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
$$('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const id=link.getAttribute('href').slice(1);if(!document.getElementById(id))return;event.preventDefault();closeMenu();visit(id);}));
document.addEventListener('click',event=>{if(!$('.document-index').contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
let sceneObserver;
if('IntersectionObserver' in window){sceneObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;activePage=Number(entry.target.dataset.page);root.dataset.scene=entry.target.dataset.scene;$('#current-page').textContent=String(activePage).padStart(2,'0');$('#current-scene').textContent=['DOCUMENT','PROPOSAL','REVISIONS','CONVERSATION','INVITATION','BEGINNING'][activePage];$$('.chapter-link').forEach((link,i)=>{if(i===activePage)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});sound.chapter(activePage);});},{rootMargin:'-35% 0px -55% 0px',threshold:0});$$('.scene').forEach(scene=>sceneObserver.observe(scene));}

$$('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.dialog);dialogTrigger=button;sound.tick();if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');$('.dialog-close',dialog).focus();}}));
$$('.note-dialog').forEach(dialog=>{
  const close=()=>{if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');dialogTrigger?.focus();}};
  $$('.dialog-close',dialog).forEach(button=>button.addEventListener('click',close));dialog.addEventListener('close',()=>dialogTrigger?.focus());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();});
  dialog.addEventListener('keydown',event=>{if(typeof dialog.showModal==='function')return;const controls=$$('button,a[href]',dialog);if(event.key==='Escape')close();if(event.key==='Tab'){if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus();}}});
});
$('#replay').addEventListener('click',()=>{
  timers.forEach(clearTimeout);timers.clear();animations.forEach(animation=>animation.cancel());animations.clear();dispatch({type:'REPLAY'});
  wishNodes.forEach((node,i)=>wishHomes[i].appendChild(node));$('.welcome-letter').hidden=true;$('.invitation-document').classList.remove('is-letter');root.classList.remove('letter-made');$('#begin-status').textContent='';$('#begin-chapter').disabled=false;$('#begin-chapter').removeAttribute('aria-busy');
  $('#document').classList.remove('is-open');$$('.cover-leaf').forEach(leaf=>{leaf.inert=false;});$('#open-proposal').disabled=false;paintRevisions();closeMenu();visit('document');sound.tick();
});
window.addEventListener('pagehide',event=>{if(event.persisted){sound.context?.suspend().catch(()=>{});return;}timers.forEach(clearTimeout);animations.forEach(animation=>animation.cancel());sceneObserver?.disconnect();sound.destroy();});
window.addEventListener('pageshow',event=>{if(event.persisted&&sound.enabled)sound.context?.resume().then(()=>sound.chapter(activePage)).catch(()=>{sound.enabled=false;soundLabel();});});
