/* Framework-free by design: no CDN, no network calls, no scroll hijacking. */
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const copy = window.PROPOSAL_COPY || {};
  const timers = new Set();
  const later = (fn, delay) => { const timer = setTimeout(() => { timers.delete(timer); fn(); }, delay); timers.add(timer); return timer; };
  const language = () => root.dataset.lang || 'zh';
  const t = (zh, en) => language() === 'en' ? en : zh;
  const localized = key => copy[key]?.[language()==='en'?1:0] || key;
  const paintText = (element,key) => {
    element.replaceChildren();
    ['zh','en'].forEach((lang,i)=>{const span=document.createElement('span');span.className=`i18n lang-${lang}`;span.lang=lang==='zh'?'zh-CN':'en';span.textContent=copy[key]?.[i] || key;element.appendChild(span);});
  };
  const announce = value => { $('#announcer').textContent = value; };
  const focusTitle = id => { const node = $(`#${id} h1, #${id} h2`); node.setAttribute('tabindex', '-1'); node.focus({preventScroll:true}); };
  const visit = id => { document.getElementById(id).scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block:'start'}); focusTitle(id); };
  let readerStep = 0, begun = false, beginning = false, currentChapter = 0;

  class Sound {
    constructor() { this.enabled = false; this.context = null; this.gain = null; this.oscillators = []; }
    async toggle() {
      if (this.enabled) { this.enabled = false; this.gain.gain.setTargetAtTime(0,this.context.currentTime,.06); return false; }
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('Audio unavailable');
      if (!this.context) {
        this.context = new Context(); this.gain = this.context.createGain(); this.gain.gain.value = 0;
        this.gain.connect(this.context.destination);
        [130.81,196].forEach(frequency => { const oscillator = this.context.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.connect(this.gain); oscillator.start(); this.oscillators.push(oscillator); });
      }
      await this.context.resume();
      if (this.context.state !== 'running') throw new Error('Audio paused');
      this.enabled = true; this.chapter(currentChapter); this.tick('open'); return true;
    }
    chapter(chapter) {
      if (!this.enabled) return;
      const level = [0.009,0.009,0.01,0.015,0.012,0.007][chapter];
      this.gain.gain.setTargetAtTime(level,this.context.currentTime,1.1);
      this.oscillators[1].frequency.setTargetAtTime(chapter >= 3 ? 174.61 : 196,this.context.currentTime,1.5);
    }
    tick(kind = 'paper') {
      if (!this.enabled || this.context.state !== 'running') return;
      const context = this.context, gain = context.createGain(), now = context.currentTime;
      gain.connect(context.destination); gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.025,now+.015); gain.gain.exponentialRampToValueAtTime(.0001,now+.25);
      if (kind === 'paper') {
        const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .25), context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i=0;i<samples.length;i++) samples[i] = (Math.random()*2-1)*.3;
        const source=context.createBufferSource(), filter=context.createBiquadFilter(); source.buffer=buffer; filter.type='lowpass'; filter.frequency.value=1200;
        source.connect(filter); filter.connect(gain); source.start(now); source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
      } else {
        const tone=context.createOscillator(); tone.frequency.value=kind==='begin'?523.25:392; tone.type='sine'; tone.connect(gain); tone.start(now); tone.stop(now+.26); tone.onended=()=>{tone.disconnect();gain.disconnect();};
      }
    }
    destroy() { this.oscillators.forEach(oscillator => oscillator.stop()); this.context?.close(); }
  }
  const sound = new Sound();
  const setSoundLabel = enabled => {
    $('#sound-toggle').setAttribute('aria-pressed',String(enabled));
    paintText($('#sound-label'),enabled?'soundOn':'soundOff');
  };
  $('#sound-toggle').addEventListener('click', async () => {
    const button=$('#sound-toggle');button.disabled=true;
    try { setSoundLabel(await sound.toggle()); }
    catch { sound.enabled=false; setSoundLabel(false); announce(localized('soundUnavailable')); }
    finally { button.disabled=false; }
  });
  document.addEventListener('visibilitychange', () => {
    if (!sound.context || !sound.enabled) return;
    if (document.hidden) sound.context.suspend().catch(()=>{});
    else sound.context.resume().then(()=>sound.chapter(currentChapter)).catch(()=>{sound.enabled=false;setSoundLabel(false);});
  });

  function setLanguage(lang, persist = true) {
    root.dataset.lang=lang; root.lang=lang==='en'?'en':'zh-CN';
    $('.language-current').textContent=lang==='en'?'EN':'中';$('.language-other').textContent=lang==='en'?'中':'EN';
    $('#language-toggle').setAttribute('aria-label',t('Switch to English','切换为中文'));
    $('.wordmark').setAttribute('aria-label',t('DEAR MR. ZOU，返回封面','DEAR MR. ZOU, back to the cover'));
    $('.annotation-trigger').setAttribute('aria-label',localized('coverNote'));
    $$('.dialog-top .dialog-close').forEach(b=>b.setAttribute('aria-label',localized('close')));
    document.title=t('DEAR MR. ZOU｜来自2603班的一份特别提案','DEAR MR. ZOU | A Proposal From Class 2603');
    if (begun) $('#begin-status').textContent=localized('begun');
    else if (beginning) $('#begin-status').textContent=localized('beginning');
    if (persist) { try { localStorage.setItem('dear-zou-language',lang); } catch {} }
  }
  try { setLanguage(localStorage.getItem('dear-zou-language')==='en'?'en':'zh',false); } catch { setLanguage('zh',false); }
  $('#language-toggle').addEventListener('click',()=>{setLanguage(language()==='en'?'zh':'en');sound.tick();});

  let revealObserver, chapterObserver;
  if ('IntersectionObserver' in window) {
    revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:0.08,rootMargin:'