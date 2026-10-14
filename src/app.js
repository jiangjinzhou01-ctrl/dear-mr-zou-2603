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
    revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:0.08,rootMargin:'0px 0px 0px 0px'});
    $$('.reveal').forEach(element=>revealObserver.observe(element));
    root.classList.add('motion-ready');
    chapterObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){currentChapter=Number(entry.target.dataset.chapter);document.body.dataset.activeChapter=String(currentChapter);$('#current-chapter').textContent=String(currentChapter).padStart(2,'0');$$('.chapter-link').forEach((link,i)=>{if(i===currentChapter)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});sound.chapter(currentChapter);}});},{rootMargin:'-26% 0px -58% 0px',threshold:0});
    $$('.chapter').forEach(element=>chapterObserver.observe(element));
  }
  reduced.addEventListener?.('change',()=>{if(reduced.matches)$$('.reveal').forEach(e=>e.classList.add('is-visible'));});

  $('#open-proposal').addEventListener('click',()=>{
    const button=$('#open-proposal');if(button.disabled)return;
    button.disabled=true;sound.tick('open');
    if(reduced.matches){visit('who');button.disabled=false;return;}
    root.classList.add('opening');
    later(()=>visit('who'),560);
    later(()=>{root.classList.remove('opening');button.disabled=false;},1450);
  });
  $$('.revision-button').forEach(button=>button.addEventListener('click',()=>{
    const row=button.closest('.revision-row'), revised=!row.classList.contains('is-revised');
    row.classList.toggle('is-revised',revised);button.setAttribute('aria-expanded',String(revised));$('.revision-note',row).hidden=!revised;
    paintText($('.revision-label',row),revised?'editBack':'editAction');
    sound.tick();announce(revised?t('批注已展开。','Annotation opened.'):t('批注已收起。','Annotation closed.'));
  }));

  const nextButton=$('#conversation-next');
  function completeReader() {
    $('#hello-message').hidden=false;$('#hello-message').classList.add('is-new');
    paintText($('#conversation-next-label'),'continueProposal');
    $('.reader-counter').textContent='04 / 04';readerStep=4;
  }
  nextButton.addEventListener('click',()=>{
    sound.tick();
    if(readerStep>=4){visit('proposal');return;}
    if(readerStep<3){readerStep++;const line=$(`[data-line="${readerStep}"]`);line.hidden=false;line.classList.add('is-new');$('.reader-counter').textContent=`0${readerStep+1} / 04`;}
    else completeReader();
  });

  $('#begin-chapter').addEventListener('click',()=>{
    if(begun){visit('beginning');return;}
    if(beginning)return;beginning=true;
    const button=$('#begin-chapter');button.disabled=true;button.setAttribute('aria-busy','true');
    $('#proposal').classList.add('is-begun');sound.tick('begin');$('#begin-status').textContent=localized('beginning');
    later(()=>{begun=true;beginning=false;button.disabled=false;button.removeAttribute('aria-busy');$('#begin-status').textContent=localized('begun');visit('beginning');},reduced.matches?0:1600);
  });

  const toggle=$('#chapter-toggle'), menu=$('#chapter-menu');
  const closeMenu=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');};
  toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
  $$('.chapter-link').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();closeMenu();visit(link.hash.slice(1));}));
  document.addEventListener('click',event=>{if(!$('.chapter-progress').contains(event.target))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});

  let dialogTrigger;
  $$('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{
    const dialog=document.getElementById(button.dataset.dialog);dialogTrigger=button;sound.tick();
    if(typeof dialog.showModal==='function')dialog.showModal();
    else {dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');$('.dialog-close',dialog).focus();}
  }));
  $$('.note-dialog').forEach(dialog=>{
    const close=()=>{if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');dialogTrigger?.focus();}};
    $$('.dialog-close',dialog).forEach(button=>button.addEventListener('click',close));
    dialog.addEventListener('close',()=>dialogTrigger?.focus());
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();});
    dialog.addEventListener('keydown',event=>{if(typeof dialog.showModal==='function')return;const controls=$$('button,a[href]',dialog);if(event.key==='Escape')close();if(event.key==='Tab'){if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus();}}});
  });

  $('#replay').addEventListener('click',()=>{
    timers.forEach(clearTimeout);timers.clear();root.classList.remove('opening');$('#open-proposal').disabled=false;
    readerStep=0;begun=false;beginning=false;
    $$('.conversation-line').forEach((line,i)=>{line.hidden=i>0;line.classList.remove('is-new');});
    $('#hello-message').hidden=true;$('#hello-message').classList.remove('is-new');$('.reader-counter').textContent='01 / 04';
    paintText($('#conversation-next-label'),'nextLine');
    $$('.revision-row').forEach(row=>{row.classList.remove('is-revised');$('.revision-button',row).setAttribute('aria-expanded','false');$('.revision-note',row).hidden=true;paintText($('.revision-label',row),'editAction');});
    $('#proposal').classList.remove('is-begun');$('#begin-chapter').disabled=false;$('#begin-chapter').removeAttribute('aria-busy');$('#begin-status').textContent='';closeMenu();visit('document');sound.tick();
  });
  window.addEventListener('pagehide',event=>{
    if(event.persisted){sound.context?.suspend().catch(()=>{});return;}
    timers.forEach(clearTimeout);revealObserver?.disconnect();chapterObserver?.disconnect();sound.destroy();
  });
  window.addEventListener('pageshow',event=>{if(event.persisted&&sound.enabled)sound.context?.resume().then(()=>sound.chapter(currentChapter)).catch(()=>{sound.enabled=false;setSoundLabel(false);});});
})();
