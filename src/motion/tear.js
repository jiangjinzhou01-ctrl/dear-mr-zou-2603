import {clamp,easeOut,reducedMotion,tearPose,MOTION} from './tokens.js';
export function createTear({onChange}){
  const scene=document.getElementById('interruption');
  const fragments=document.getElementById('contract-fragments');
  const range=document.getElementById('tear-range');
  const direct=document.getElementById('tear-direct');
  let value=0,frame=0,width=scene.clientWidth,height=window.innerHeight;
  // These are actual slices of one physical sheet, not decorative particles.
  for(let i=0;i<6;i++){
    const slice=document.createElement('div');slice.className='contract-fragment';
    const y=i*100/6,next=(i+1)*100/6;
    slice.style.clipPath=`polygon(0 ${y}%,17% ${y+.25}%,35% ${y-.15}%,55% ${y+.3}%,78% ${y-.2}%,100% ${y}%,100% ${next}%,80% ${next+.25}%,62% ${next-.15}%,40% ${next+.25}%,20% ${next-.2}%,0 ${next}%)`;
    slice.innerHTML='<span class="sheet-edge"></span><div class="fragment-title">STRATEGIC<br>PARTNERSHIP.</div>';fragments.append(slice);
  }
  const sheets=[...fragments.children];
  const set=(next)=>{
    value=clamp(next);range.value=String(Math.round(value*100));scene.style.setProperty('--tear',value);
    scene.classList.toggle('torn',value>=.995);
    sheets.forEach((slice,i)=>{const pose=tearPose(i,value,width,height);slice.style.transform=`translate(${pose.x}px,${pose.y}px) rotate(${pose.rotate}deg)`;slice.style.opacity=pose.opacity;});
    document.querySelector('.formal-title').style.transform=`translateX(${-width*.38*value}px) rotate(${-8*value}deg)`;
    document.querySelector('.formal-title').style.opacity=1-clamp(value*1.7);
    document.querySelector('.formal-aside').style.opacity=1-clamp(value*2);
    document.querySelector('.contract-margin').style.opacity=1-clamp(value*2);
    document.querySelector('.contract-redaction').style.transform=`translateX(${width*value}px) rotate(${8*value}deg)`;
    document.querySelector('.contract-redaction').style.opacity=1-value;
    document.querySelector('.honest-message').style.opacity=clamp(value*1.5);
    document.querySelector('.honest-message').style.transform=`scale(${.91+value*.09})`;
    onChange(value);
  };
  const tween=(target)=>{
    cancelAnimationFrame(frame);
    if(reducedMotion.matches){set(target);return;}
    const start=performance.now(),from=value,duration=MOTION.duration.paper;
    const step=now=>{const p=clamp((now-start)/duration);set(from+(target-from)*easeOut(p));if(p<1)frame=requestAnimationFrame(step);};
    frame=requestAnimationFrame(step);
  };
  range.addEventListener('input',()=>{cancelAnimationFrame(frame);set(Number(range.value)/100);});
  const settle=()=>{if(value>.83&&value<1)tween(1);};
  range.addEventListener('change',settle);
  range.addEventListener('pointerup',settle);
  direct.addEventListener('click',()=>tween(value>=.995?0:1));
  const observer=new ResizeObserver(()=>{width=scene.clientWidth;height=window.innerHeight;set(value);});observer.observe(scene);
  set(0);
  return {reset:()=>{cancelAnimationFrame(frame);set(0);},get value(){return value;},finish:()=>tween(1)};
}
