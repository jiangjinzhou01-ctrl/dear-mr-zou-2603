import {MOTION,reducedMotion} from './tokens.js';
export function createResolution({onResolve}){
  const scene=document.getElementById('welcome');
  const pieces=document.getElementById('welcome-pieces');
  const button=document.getElementById('begin-stamp');
  const ending=document.querySelector('.ending');
  ending.inert=true;
  const scraps=['STRATEGIC','PARTNERSHIP','PROPOSED','AGREEMENT','SUBJECT TO','REGARDS','2603'];
  const positions=[[-24,-80,-23],[-12,30,14],[5,-50,-8],[-3,54,22],[6,-88,-16],[19,40,11],[21,-12,28]];
  let done=false,busy=false,timer;
  const animations=[];
  [...'WELCOME'].forEach((letter,i)=>{
    const piece=document.createElement('span');piece.className='welcome-piece';piece.innerHTML=`<span class="scrap-type">${scraps[i]}</span><span class="welcome-letter">${letter}</span>`;piece.style.setProperty('--scatter-x',`${positions[i][0]}vw`);piece.style.setProperty('--scatter-y',`${positions[i][1]}px`);piece.style.setProperty('--scatter-r',`${positions[i][2]}deg`);pieces.append(piece);
  });
  const resolve=()=>{
    if(done||busy)return;busy=true;scene.classList.add('resolving');button.disabled=true;
    const duration=reducedMotion.matches?0:MOTION.duration.settle;
    scene.classList.add('resolved');
    pieces.querySelectorAll('.welcome-piece').forEach((piece,i)=>{
      if(!duration)return;
      const p=positions[i];
      const a=piece.animate([{transform:`translate(${p[0]}vw,${p[1]}px) rotate(${p[2]}deg)`},{transform:'translate(0,0) rotate(0)'}],{duration,delay:i*MOTION.stagger.paper,easing:MOTION.easing.settle,fill:'both'});animations.push(a);
    });
    ending.inert=false;onResolve();
    timer=setTimeout(()=>{done=true;busy=false;scene.classList.remove('resolving');},duration+300);
  };
  button.addEventListener('click',resolve);
  return {reset(){clearTimeout(timer);animations.splice(0).forEach(a=>a.cancel());done=false;busy=false;button.disabled=false;ending.inert=true;scene.classList.remove('resolved','resolving');},resolve,get done(){return done;}};
}
