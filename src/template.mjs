import {facts, copy, revisions, proposal} from './content.mjs';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const text = key => `<span class="i18n lang-zh" lang="zh-CN">${escape(copy[key][0]).replaceAll('\n','<br>')}</span><span class="i18n lang-en" lang="en">${escape(copy[key][1]).replaceAll('\n','<br>')}</span>`;
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const chapter = (n,name) => `<div class="chapter-rule"><span class="mono">${n}</span><span class="mono">${name}</span><span class="rule-line" aria-hidden="true"></span><span class="mono">2603</span></div>`;
const futureContent = () => facts.futureEntries.length ? facts.futureEntries.map(entry=>`<article class="future-entry"><time class="mono">${escape(entry.date)}</time><h3>${escape(entry.title)}</h3><p><span class="i18n lang-zh" lang="zh-CN">${escape(entry.zh)}</span><span class="i18n lang-en" lang="en">${escape(entry.en)}</span></p></article>`).join('') : '<div class="future-blank" aria-hidden="true"><span>________________</span><span>________________</span></div>';
export function render() { return `<!doctype html>
<html lang="zh-CN" data-lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#F4F2EC"><title>DEAR MR. ZOU｜来自2603班的一份特别提案</title><meta name="description" content="一份来自2603班的特别提案。以商务英语为序，认真说一句：邹老师，欢迎您。"><meta property="og:title" content="DEAR MR. ZOU — A Proposal From Class 2603"><meta property="og:description" content="Make it feel like a proposal. Let it unfold like a conversation."><meta property="og:type" content="website"><link rel="icon" type="image/svg+xml" href="./assets/favicon.svg"><link rel="preload" href="./assets/editorial-roman.woff" as="font" type="font/woff" crossorigin><link rel="stylesheet" href="./styles.css"><script defer src="./app.js"></script></head>
<body>
<a class="skip-link" href="#who">${text('skip')}</a>
<header class="topbar"><a class="wordmark" href="#document" aria-label="DEAR MR. ZOU，返回封面">2603<span class="wordmark-line" aria-hidden="true"></span><span>CLASS<br>COMMUNICATION</span></a><div class="controls"><button id="sound-toggle" class="control mono" type="button" aria-pressed="false"><span class="sound-symbol" aria-hidden="true"><i></i><i></i><i></i></span><span id="sound-label">${text('soundOff')}</span></button><button id="language-toggle" class="control mono" type="button" aria-label="Switch to English"><span class="language-current">中</span><span class="language-slash" aria-hidden="true">/</span><span class="language-other">EN</span></button></div></header>
<main>
<section id="document" class="hero chapter" data-chapter="0" aria-labelledby="hero-title">
  <div class="hero-meta mono"><span>OFFICIAL COMMUNICATION</span><span>DOCUMENT NO. ${escape(facts.documentNo)}</span></div>
  <div class="hero-composition"><div class="hero-heading"><h1 id="hero-title"><span class="mask"><span>DEAR</span></span><span class="mask"><span>MR. ZOU<span class="comma">,</span></span></span></h1><p class="hero-statement">We have a proposal.</p></div>
    <div class="document-cover" aria-label="Class 2603, a proposal"><span class="cover-id mono">2603 / 001</span><div class="cover-title">A<br>FIRST<br>HELLO<span class="cover-period">.</span></div><div class="cover-bottom"><span class="mono">FROM CLASS 2603<br>TO MR. ZOU</span><button class="annotation-trigger" type="button" data-dialog="cover-dialog" aria-haspopup="dialog" aria-label="${escape(copy.coverNote[0])}">※</button></div><div class="fold" aria-hidden="true"></div></div>
  </div>
  <div class="hero-bottom"><div class="hero-intro">${text('heroIntro')}</div><button class="primary open-button" id="open-proposal" type="button"><span class="button-copy"><span class="mono">${text('openEn')}</span><span class="button-caption">${text('open')}</span></span>${arrow}</button></div>
  <div class="hero-foot mono"><span>A PROPOSAL FROM CLASS 2603</span><span>00 / 05</span></div>
</section>

<section id="who" class="who chapter" data-chapter="1" aria-labelledby="who-title">
  ${chapter('01','WHO WE ARE')}
  <div class="who-header"><h2 id="who-title" class="sans-title reveal" data-reveal="mask">WHO<br>WE ARE.</h2><p class="section-intro reveal" data-reveal="focus">${text('whoIntro')}</p></div>
  <div class="identity-layout"><div class="class-number reveal" data-reveal="scale">${escape(facts.className)}<span class="number-caption mono">CLASS / EST. ${escape(facts.established)}</span></div><div class="identity-copy"><span class="mono">A BRIEF COMPANY PROFILE</span><p class="identity-statement">${text('classDescriptor')}</p><span class="identity-line" aria-hidden="true"></span></div></div>
  <dl class="organization-ledger">
    ${[['orgLabel','orgBody','OUR ORGANIZATION'],['operationsLabel','operationsBody','CORE OPERATIONS'],['hoursLabel','hoursBody','WORKING HOURS'],['missionLabel','missionBody','OUR MISSION']].map(([label,body,en],i)=>`<div class="ledger-entry reveal" data-reveal="rule"><dt><span class="mono">${en}</span><span class="ledger-label">${text(label)}</span></dt><dd>${text(body)}</dd></div>`).join('')}
  </dl>
  <button type="button" class="text-button small-print" data-dialog="small-dialog" aria-haspopup="dialog"><span class="mono">* THE SMALL PRINT</span><span>${text('smallPrint')}</span><span aria-hidden="true">＋</span></button>
</section>

<section id="human" class="human chapter" data-chapter="2" aria-labelledby="human-title">
  ${chapter('02','BEHIND THE DOCUMENT')}
  <h2 id="human-title" class="human-title reveal" data-reveal="mask">BEHIND THE<br><span class="outlined">DOCUMENT.</span></h2>
  <p class="section-intro">${text('behindIntro')}</p><p class="interaction-hint">${text('editHint')}</p>
  <div class="revision-list">${revisions.map((r,i)=>`<div class="revision-row" data-revision="${i}"><span class="revision-index mono">0${i+1}</span><button class="revision-button" type="button" aria-expanded="false" aria-controls="revision-note-${i}"><span class="formal-phrase" lang="en">${escape(r.formal)}</span><span class="honest-phrase" lang="en">${escape(r.honest)}</span><span class="revision-tool" aria-hidden="true">↗</span><span class="sr-only revision-label">${text('editAction')}</span></button><div class="revision-note" id="revision-note-${i}" hidden><p>${text(r.key)}</p><span>${text(r.note)}</span></div></div>`).join('')}</div>
  <p class="margin-note">${text('margin')}</p>
</section>

<section id="conversation" class="conversation chapter" data-chapter="3" aria-labelledby="conversation-title">
  ${chapter('03','THE FIRST CONVERSATION')}
  <div class="conversation-opening"><h2 id="conversation-title" class="conversation-title reveal" data-reveal="focus">We don’t know<br>each other<br>very well.</h2><p class="not-yet reveal" data-reveal="ink">Not yet.</p></div>
  <p class="conversation-intro">${text('notYet')}</p>
  <div class="reader" aria-live="polite" aria-atomic="false"><span class="reader-line" aria-hidden="true"></span><div id="conversation-lines">${['line01','line02','line03','line04'].map((key,i)=>`<p class="conversation-line" data-line="${i}"${i>0?' hidden':''}>${text(key)}</p>`).join('')}</div><div class="hello-message" id="hello-message" hidden><p lang="en">Hello, Mr. Zou.</p><span>${text('hello')}</span></div></div>
  <button class="conversation-next text-button" id="conversation-next" type="button"><span id="conversation-next-label">${text('nextLine')}</span><span class="mono reader-counter" aria-hidden="true">01 / 04</span><span aria-hidden="true">→</span></button>
</section>

<section id="proposal" class="proposal chapter" data-chapter="4" aria-labelledby="proposal-title">
  ${chapter('04','OUR PROPOSAL')}
  <h2 id="proposal-title" class="proposal-title reveal" data-reveal="mask">A PROPOSAL<br>FOR WHAT<br>COMES NEXT<span class="green-period">.</span></h2>
  <p class="section-intro">${text('proposalIntro')}</p>
  <ol class="proposal-clauses">${proposal.map((p,i)=>`<li class="proposal-clause reveal" data-reveal="rule"><span class="clause-number mono">0${i+1}</span><h3 lang="en">${p.title}</h3><p>${text(p.key)}</p></li>`).join('')}</ol>
  <div class="invitation-bottom"><div class="address-block"><div><span class="mono">PROPOSED BY</span><strong>CLASS ${escape(facts.className)}</strong></div><div><span class="mono">ADDRESSED TO</span><strong>MR. ZOU</strong></div></div><p class="invitation-note">${text('invitationNote')}</p><button id="begin-chapter" class="primary begin-button" type="button"><span class="button-copy"><span class="mono">${text('beginEn')}</span><span class="button-caption">${text('begin')}</span></span><span class="arrow" aria-hidden="true">→</span></button><div class="welcome-ink" id="welcome-ink" aria-hidden="true"><svg viewBox="0 0 620 110" fill="none"><path d="M12 77C38 25 62 9 84 21C109 36 59 101 49 81C42 67 105 29 130 34C152 38 129 76 145 73C169 67 177 40 188 34C204 26 176 89 206 65C244 31 261 32 246 58C233 81 269 71 290 45C309 23 306 54 319 58C335 63 351 38 366 36C389 33 358 74 390 60C417 47 437 24 443 43C450 62 463 54 479 42C501 25 501 61 516 54C535 45 550 31 563 44M31 96C166 83 400 89 602 71"/></svg></div><p class="begin-status" id="begin-status" role="status"></p></div>
</section>

<section id="beginning" class="ending chapter" data-chapter="5" aria-labelledby="ending-title">
  <div class="ending-top mono"><span>05 / THE BEGINNING</span><span>2603-001</span></div>
  <div class="ending-main"><p class="ending-address reveal" data-reveal="focus">SO, MR. ZOU,</p><h2 id="ending-title" class="ending-title reveal" data-reveal="quiet">SHALL WE<br><em>BEGIN?</em></h2><p class="ending-copy reveal" data-reveal="focus">${text('ending')}</p><div class="ending-signoff"><span class="mono">WITH WARM REGARDS,</span><span>CLASS 2603</span><span class="mono">EST. ${escape(facts.established)}</span></div></div>
  <div class="ending-bottom"><button id="replay" type="button" class="text-button"><span>${text('replay')}</span><span aria-hidden="true">↺</span></button><button type="button" class="text-button future-button" data-dialog="future-dialog" aria-haspopup="dialog"><span>${text('future')}</span><span class="mono">TO BE CONTINUED ↗</span></button></div>
</section>
</main>
<nav class="chapter-progress" aria-label="Proposal progress"><button id="chapter-toggle" type="button" aria-expanded="false" aria-controls="chapter-menu"><span class="progress-label mono">PROPOSAL</span><span class="progress-number mono"><b id="current-chapter">00</b><span> / 05</span></span><span class="progress-plus" aria-hidden="true">＋</span><span class="sr-only">${text('chapterNav')}</span></button><div id="chapter-menu" hidden>${['THE DOCUMENT','WHO WE ARE','BEHIND THE DOCUMENT','THE FIRST CONVERSATION','OUR PROPOSAL','SHALL WE BEGIN?'].map((name,i)=>`<a href="#${['document','who','human','conversation','proposal','beginning'][i]}" class="chapter-link"><span class="mono">0${i}</span><span lang="en">${name}</span></a>`).join('')}</div></nav>
${[['cover-dialog','noteTitle','noteBody','DOCUMENT ANNOTATION'],['small-dialog','smallTitle','smallBody','A NOTE FROM CLASS 2603'],['future-dialog','futureTitle','futureBody','A MESSAGE FOR LATER']].map(([id,title,body,tag])=>`<dialog id="${id}" class="note-dialog" aria-labelledby="${id}-title"><div class="dialog-top"><span class="mono">${tag}</span><button class="dialog-close" type="button" aria-label="Close">×</button></div><h2 id="${id}-title">${text(title)}</h2><p>${text(body)}</p>${id==='future-dialog'?futureContent():''}<button class="dialog-close text-button" type="button">${text('close')}<span aria-hidden="true">↗</span></button></dialog>`).join('')}
<div id="announcer" class="sr-only" role="status" aria-live="polite"></div>
<noscript><style>.conversation-line[hidden],.hello-message[hidden]{display:block}.revision-note[hidden]{display:block}.revision-button{pointer-events:none}.primary,.controls,.chapter-progress{display:none}</style><p class="no-js">本作品的完整文字可直接阅读；开启 JavaScript 可体验文字改写与开启仪式。</p></noscript>
</body></html>`; }
