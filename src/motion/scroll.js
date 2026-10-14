// ViewTimeline runs on the browser animation timeline. No scroll interception.
// Older engines seek paused WAAPI animations only when the scroll position changes.
// One observer and one shared fallback scheduler; no React render loop.
import {clamp,reducedMotion} from './tokens.js';
const bindings=[];
let frame=0,lastY=-1,lastHeight=-1;
let nativeTimeline=typeof window.ViewTimeline==='function';

function schedule(){if(!frame && !reducedMotion.matches && !nativeTimeline) frame=requestAnimationFrame(tick);}
function tick(){
  frame=0;
  if(document.hidden||reducedMotion.matches) return;
  const y=window.scrollY,h=window.innerHeight;
  if(y!==lastY||h!==lastHeight){
    for(const binding of bindings){
      const rect=binding.scene.getBoundingClientRect();
      const p=clamp(-rect.top/Math.max(1,rect.height-h));
      binding.animations.forEach(animation=>{animation.currentTime=p*1000;});
    }
    lastY=y;lastHeight=h;
  }
  if(bindings.some(binding=>binding.active)) schedule();
}
const visibility=new IntersectionObserver(entries=>{
  for(const entry of entries){const found=bindings.find(x=>x.scene===entry.target);if(found) found.active=entry.isIntersecting;}
  lastY=-1;schedule();
},{rootMargin:'100px 0px'});

export function bindScroll(scene, specs){
  if(reducedMotion.matches) return;
  const binding={scene,animations:[],active:false};
  for(const spec of specs){
    const elements=scene.querySelectorAll(spec.selector);
    elements.forEach((element,index)=>{
      const keyframes=typeof spec.frames==='function'?spec.frames(index):spec.frames;
      let animation;
      if(nativeTimeline){
        try{animation=element.animate(keyframes,{timeline:new ViewTimeline({subject:scene,axis:'block'}),rangeStart:'contain 0%',rangeEnd:'contain 100%',fill:'both'});}
        catch{nativeTimeline=false;}
      }
      if(!animation){animation=element.animate(keyframes,{duration:1000,fill:'both'});animation.pause();animation.currentTime=0;}
      binding.animations.push(animation);
    });
  }
  bindings.push(binding);visibility.observe(scene);schedule();
}
export function clearScroll(){
  for(const binding of bindings){binding.animations.forEach(a=>a.cancel());visibility.unobserve(binding.scene);}
  bindings.length=0;if(frame)cancelAnimationFrame(frame);frame=0;lastY=-1;lastHeight=-1;
}
document.addEventListener('visibilitychange',()=>{lastY=-1;schedule();});
