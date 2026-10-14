// The same red seal changes meaning across the whole film.
// Distinct timing families: cut (entry), paper (interaction), breathe (quiet scene).
export const MOTION = Object.freeze({
  duration: {cut:560, type:780, paper:1120, settle:1380, breathe:1700, touch:180},
  easing: {
    cut:'cubic-bezier(.76,0,.18,1)',
    paper:'cubic-bezier(.16,1,.3,1)',
    settle:'cubic-bezier(.22,.8,.16,1)',
    breathe:'cubic-bezier(.4,0,.2,1)'
  },
  stagger: {character:38, paper:48}
});
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionOverride=null;
export const reducedMotion=new EventTarget();
Object.defineProperty(reducedMotion,'matches',{get:()=>motionOverride??systemMotion.matches});
function syncMotionPreference(){
  if(typeof document!=='undefined'){
    document.documentElement.setAttribute('data-motion-ready','');
    document.documentElement.toggleAttribute('data-reduced-motion',reducedMotion.matches);
  }
  reducedMotion.dispatchEvent(new Event('change'));
}
export function setReducedMotion(value){motionOverride=Boolean(value);syncMotionPreference();}
systemMotion.addEventListener?.('change',syncMotionPreference);
syncMotionPreference();
export const clamp = (value, min=0, max=1) => Math.min(max,Math.max(min,value));
export const easeOut = t => 1-Math.pow(1-t,3);
export function tearPose(index, progress, width, height) {
  const p=clamp(progress), side=index%2===0?-1:1;
  const distance=width*(.82+index*.055);
  return {x:side*distance*p,y:(index-2.5)*height*.1*p,rotate:side*(11+index*4)*p,opacity:1-clamp((p-.8)/.2)};
}
