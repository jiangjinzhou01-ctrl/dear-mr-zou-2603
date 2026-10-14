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
  <div class="revision-list">${revisions.map((r,i)=>`<div class="revision-row" data-revision="${i}"><span class="revision-index mono">0${i+1}</span><button class="revision-button" type="button" aria-expanded="false" aria-controls="revision-note-${i}"><span class="formal-phrase" lang="en">${escape(r.formal)}</span><span class="honest-phrase" lang="en">${escape(r.honest)}</span><span class="revision-tool" aria-hidden="true">↗</span><span class="sr-only revision-label">${text('editAction')}</span></button><div class="rev