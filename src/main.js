import {applyLanguage,copy} from './content.js';
import {prepareTitle,playOpening,cancelOpening} from './motion/opening.js';
import {bindScroll,clearScroll} from './motion/scroll.js';
import {createTear} from './motion/tear.js';
import {createResolution} from './motion/resolution.js';
import {reducedMotion,setReducedMotion} from './motion/tokens.js';

let language='zh';
const motionMedia=matchMedia('(max-width: 767px)');
const dictionary=()=>copy[language];
prepareTitle();
const syncTear=p=>{
  const percent=Math.round(p*100),dict=dictionary();
  const range=document.getElementById('tear-range');range.setAttribute('aria-valuetext',dict.tearValue(percent));
  document.querySelector('.tear-percent').textContent=`${percent}%`;
  document.getElementById('tear-hint').textContent=p>=.995?dict.tearComplete:dict.tearHint;
  document.getElementById('tear-direct').textContent=p>=.995?dict.tearReplay:dict.tearDirect;
  document.getElementById('tear-announcement').textContent=p>=.995?dict.tearComplete:'';
};
const tear=createTear({onChange:syncTear});
const resolution=createResolution({onResolve:()=>{document.getElementById('welcome-announcement').textContent=dictionary().welcomeAnnouncement;}});
applyLanguage(language);
const updateMotionControl=()=>{const control=document.getElementById('motion-toggle');control.textContent=reducedMotion.matches?dictionary().restoreMotion:dictionary().reduceMotion;control.setAttribute('aria-pressed',String(reducedMotion.matches));};
updateMotionControl();
document.getElementById('language').addEventListener('click',()=>{language=applyLanguage(language==='zh'?'en':'zh');syncTear(tear.value);updateMotionControl();if(resolution.done)document.getElementById('welcome-announcement').textContent=dictionary().welcomeAnnouncement;});
document.getElementById('motion-toggle').addEventListener('click',()=>setReducedMotion(!reducedMotion.matches));
reducedMotion.addEventListener('change',updateMotionControl);

const contents=document.getElementById('contents'),menu=document.getElementById('menu-toggle');
const closeMenu=()=>{contents.close();menu.setAttribute('aria-expanded','false');};
menu.addEventListener('click',()=>{if(contents.open)closeMenu();else{contents.show();menu.setAttribute('aria-expanded','true');contents.querySelector('a').focus();}});
document.getElementById('menu-close').addEventListener('click',()=>{closeMenu();menu.focus();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&contents.open){closeMenu();menu.focus();}});
document.addEventListener('pointerdown',event=>{if(contents.open&&!contents.contains(event.target)&&!menu.contains(event.target))closeMenu();});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const target=document.querySelector(link.getAttribute('href'));if(!target)return;
  event.preventDefault();closeMenu();cancelOpening();
  target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
  target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
  history.replaceState(null,'',link.getAttribute('href'));
}));

function configureScroll(){
  clearScroll();
  const mobile=motionMedia.matches;
  bindScroll(document.getElementById('arrival'),[
    {selector:'.arrival-title',frames:[{transform:'translateY(0) scale(1)',opacity:1,offset:0},{transform:'translateY(-9vh) scale(.92)',opacity:1,offset:.65},{transform:'translateY(-22vh) scale(.83)',opacity:.1}]},
    {selector:'.arrival-tape',frames:[{translate:'0 0',offset:0},{translate:'-12vw -18vh'}]},
    {selector:'.invitation-paper',frames:[{transform:'rotate(0) scale(1)',offset:0},{transform:mobile?'translateY(-10vh) rotate(6deg) scale(1.08)':'translate(-14vw,-12vh) rotate(8deg) scale(1.14)',offset:1}]},
    {selector:'.open-action,.arrival-credit',frames:[{opacity:1,offset:0},{opacity:0,offset:.45},{opacity:0}]}
  ]);
  bindScroll(document.getElementById('pitch'),[
    {selector:'.dossier',frames:[{transform:'rotate(3deg) scale(.91)'},{transform:'rotate(0) scale(1)',offset:.22},{transform:'rotate(0) scale(1)',offset:.85},{transform:'rotate(-2deg) scale(.98)'}]},
    {selector:'.class-number span',frames:i=>[{transform:`translateY(${[12,0,20,3][i]}%)`,opacity:.72},{transform:'translateY(0)',opacity:1,offset:.25},{transform:'translateY(0)',opacity:1,offset:.65},{transform:`translateY(${[0,-8,2,-5][i]}%)`,opacity:.8}]},
    {selector:'.proposal-terms > div',frames:i=>[{opacity:.8,transform:'translateX(24px)'},{opacity:1,transform:'translateX(0)',offset:.25+i*.10},{opacity:1,transform:'translateX(0)'}]},
    {selector:'.revision',frames:[{transform:'translateX(-115%) rotate(-3deg)',opacity:0,offset:0},{transform:'translateX(-115%) rotate(-3deg)',opacity:0,offset:.48},{transform:'translateX(0) rotate(-3deg)',opacity:1,offset:.7},{transform:'translateX(0) rotate(-3deg)',opacity:1}]}
  ]);
  bindScroll(document.getElementById('unscripted'),[
    {selector:'.quiet-first',frames:[{opacity:.6,transform:'translateY(8vh)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0px)',offset:.12},{opacity:1,transform:'translateY(0)',filter:'blur(0px)',offset:.32},{opacity:0,transform:'translateY(-8vh)',filter:'blur(0px)',offset:.51},{opacity:0}]},
    {selector:'.quiet-second',frames:[{opacity:0,transform:'translateY(9vh)',offset:0},{opacity:0,transform:'translateY(9vh)',offset:.4},{opacity:1,transform:'translateY(0)',offset:.64},{opacity:1,transform:'translateY(0)'}]},
    {selector:'.not-yet span',frames:[{transform:'rotate(-8deg) translateY(10px)',offset:0},{transform:'rotate(-8deg) translateY(10px)',offset:.4},{transform:'rotate(0) translateY(0)',offset:.74},{transform:'rotate(0) translateY(0)'}]},
    {selector:'.quiet-ribbon',frames:[{transform:'translateX(0) rotate(-14deg)'},{transform:'translateX(18vw) rotate(-5deg)'}]}
  ]);
}
configureScroll();motionMedia.addEventListener('change',configureScroll);reducedMotion.addEventListener('change',()=>{cancelOpening();configureScroll();});

const scenes=[...document.querySelectorAll('.scene')];
const updateSceneTone=()=>{
  const headerEdge=document.querySelector('.film-header').getBoundingClientRect().bottom+1;
  const current=scenes.find(scene=>{const r=scene.getBoundingClientRect();return r.top<=headerEdge&&r.bottom>headerEdge;});
  if(current){document.body.dataset.scene=current.id;document.body.dataset.tone=current.dataset.tone;}
};
const sceneVisibility=new IntersectionObserver(updateSceneTone,{threshold:Array.from({length:51},(_,i)=>i/50)});
scenes.forEach(scene=>sceneVisibility.observe(scene));
new ResizeObserver(updateSceneTone).observe(document.documentElement);
document.getElementById('replay').addEventListener('click',()=>{
  closeMenu();tear.reset();resolution.reset();document.getElementById('welcome-announcement').textContent='';
  window.scrollTo({top:0,behavior:'instant'});history.replaceState(null,'',location.pathname+location.search);document.body.dataset.tone='dark';
  playOpening();document.querySelector('.wordmark').focus({preventScroll:true});
});
document.body.classList.add('ready');
if(window.scrollY<60&&!location.hash)playOpening();else cancelOpening();
// A font/network failure keeps the film legible with local system fallbacks.
document.fonts?.ready.then(()=>document.body.classList.add('fonts-ready')).catch(()=>{});
