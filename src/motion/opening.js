import {MOTION,reducedMotion} from './tokens.js';
const animations=[];
let timer;
const animate=(el,frames,options)=>{if(!el)return;const a=el.animate(frames,options);animations.push(a);return a;};
export function prepareTitle(){
  document.querySelectorAll('[data-split]').forEach(el=>{
    const original=el.textContent;
    el.setAttribute('aria-label',original);el.textContent='';
    for(const character of original){const char=document.createElement('span');char.textContent=character===' '?'\u00a0':character;char.className='character';char.setAttribute('aria-hidden','true');el.append(char);}
  });
}
export function cancelOpening(){clearTimeout(timer);animations.splice(0).forEach(a=>a.cancel());document.body.classList.add('intro-done');}
export function playOpening(){
  cancelOpening();
  if(reducedMotion.matches){document.body.classList.add('intro-done');return;}
  document.body.classList.remove('intro-done');
  const cold=document.querySelector('.cold-open');
  animate(cold,[{opacity:1},{opacity:1,offset:.84},{opacity:0}],{duration:3000,fill:'both'});
  animate(document.querySelector('.cold-question span'),[{transform:'translateY(110%) rotate(3deg)'},{transform:'translateY(0) rotate(0)'},{transform:'translateY(0)',offset:.62},{transform:'translateY(-110%)'}],{duration:1600,easing:MOTION.easing.cut,fill:'both'});
  animate(document.querySelector('.cold-answer span'),[{transform:'translateY(115%)'},{transform:'translateY(0)',offset:.36},{transform:'translateY(0)',offset:.76},{transform:'translateY(-115%)'}],{delay:850,duration:1900,easing:MOTION.easing.cut,fill:'both'});
  animate(document.querySelector('.cold-rule'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:700,delay:450,easing:MOTION.easing.paper,fill:'both'});
  document.querySelectorAll('.character').forEach((el,i)=>animate(el,[{transform:`translateY(112%) rotate(${i%2?9:-7}deg)`,opacity:0},{transform:'translateY(0) rotate(0)',opacity:1}],{duration:MOTION.duration.type,delay:2050+i*MOTION.stagger.character,easing:MOTION.easing.paper,fill:'both'}));
  animate(document.querySelector('.arrival-tape'),[{transform:'translateX(-115%) rotate(-12deg)'},{transform:'translateX(0) rotate(-12deg)'}],{duration:900,delay:1800,easing:MOTION.easing.cut,fill:'both'});
  animate(document.querySelector('.invitation'),[{transform:'translate(8vw,18vh) rotate(20deg) scale(.6)',opacity:0},{transform:'translate(0,0) rotate(-8deg) scale(1)',opacity:1}],{duration:MOTION.duration.settle,delay:2350,easing:MOTION.easing.paper,fill:'both'});
  for(const selector of ['.title-caption','.open-action','.arrival-credit']) animate(document.querySelector(selector),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:2750,easing:MOTION.easing.paper,fill:'both'});
  timer=setTimeout(()=>{document.body.classList.add('intro-done');},3900);
}
