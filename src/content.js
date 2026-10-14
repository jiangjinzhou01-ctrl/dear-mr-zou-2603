// Factual content is deliberately limited to the supplied story.
// English title typography is part of the film identity; body and controls switch.
export const copy = {
  zh: {
    skip:'进入作品',contents:'场景',contentsTitle:'这份提案的目录',close:'关闭',reduceMotion:'减弱动效',restoreMotion:'恢复动效',
    navArrival:'一份神秘的邀请',navPitch:'提案方，2603班',navInterruption:'撕开正式措辞',navUnscripted:'其实，想认识您',navWelcome:'真正的提案',
    openingCaption:'致邹老师：一份意想不到的提案。',openProposal:'打开提案',
    subjectLabel:'提案主题',subject:'关于一个新开始。',partyLabel:'提案方',party:'2603班，全体同学。',
    experienceLabel:'相关经验',experience:'商务英语，正在学习。',statusLabel:'当前进度',status:'正在互相认识。',budgetLabel:'诚意预算',budget:'这一次，认真准备了。',
    revision:'开场白写得很正式。见面可能还是会有点紧张。',
    honestPreface:'好了，先把这些正式措辞放一边。',honestChinese:'其实，我们想说的是：认识一下。',continue:'继续聊聊',formalAside:'嗯……我们平时好像不这么说话。',contractRedaction:'正式措辞，可撕。',
    tearHint:'向右拉开，看看我们真正想说什么。',tearDirect:'也可以轻点拆开 ↗',tearComplete:'原来，只是想认识一下。',tearReplay:'重新封好 ↺',tearAria:'拉开封条，拆开正式措辞',tearValue:p=>p===100?'封条已打开':`封条打开 ${p}%`,
    notFamiliar:'我们还不算特别熟悉。',notYet:'但，故事才刚开始。',quietOne:'您教商务英语。',quietTwo:'这次，就让我们先练习一句：',quietHello:'很高兴认识您，邹老师。',future:'以后的故事，留到以后一起写。',
    realProposal:'让这成为一个好的开始。',begin:'一起开始',stampInstruction:'轻点印章，让提案有一个新的结尾。',welcomeChinese:'邹老师，欢迎来到2603班。',replay:'再看一次',beginAria:'一起开始，将提案拼成欢迎',
    welcomeAnnouncement:'提案已变成欢迎。邹老师，欢迎来到2603班。',arrivalAria:'打开2603班的提案',menuAria:'场景导航',title:'DEAR MR. ZOU | 一份意想不到的提案'
  },
  en: {
    skip:'Enter the film',contents:'Scenes',contentsTitle:'Inside this proposal',close:'Close',reduceMotion:'Reduce motion',restoreMotion:'Restore motion',
    navArrival:'An unexpected invitation',navPitch:'The proposing party',navInterruption:'Tear away the formalities',navUnscripted:'Getting to know you',navWelcome:'The real proposal',
    openingCaption:'An unexpected proposal, with a very simple intention.',openProposal:'Open the proposal',
    subjectLabel:'THE SUBJECT',subject:'A good beginning.',partyLabel:'PROPOSING PARTY',party:'All of us in Class 2603.',experienceLabel:'RELEVANT EXPERIENCE',experience:'Business English. Still learning.',statusLabel:'CURRENT STATUS',status:'Getting to know each other.',budgetLabel:'SINCERITY BUDGET',budget:'We put some thought into this.',
    revision:'A very formal opening. We might still be a little nervous in person.',
    honestPreface:'All right. Let’s put the formalities aside.',honestChinese:'What we really mean: let’s get to know each other.',continue:'Keep talking',formalAside:'Well… we don’t usually talk like this.',contractRedaction:'Formalities. Tear here.',tearHint:'Pull right to see what we really mean.',tearDirect:'Or tap to tear it open ↗',tearComplete:'We just wanted to say hello.',tearReplay:'Seal it again ↺',tearAria:'Pull the seal to remove the formalities',tearValue:p=>p===100?'Seal opened':`Seal ${p}% opened`,
    notFamiliar:'We don’t know each other very well.',notYet:'But the story is only just beginning.',quietOne:'You teach Business English.',quietTwo:'Let us try our first sentence:',quietHello:'It’s good to meet you, Mr.\u00a0Zou.',future:'We can write the rest of the story together.',
    realProposal:'Let’s make this a good beginning.',begin:'Let’s begin',stampInstruction:'Tap the stamp to give this proposal a new ending.',welcomeChinese:'Mr. Zou, welcome to Class 2603.',replay:'Watch again',beginAria:'Begin together and assemble the welcome',welcomeAnnouncement:'The proposal has become a welcome. Welcome to Class 2603, Mr. Zou.',arrivalAria:'Open the proposal from Class 2603',menuAria:'Scene navigation',title:'DEAR MR. ZOU | An Unexpected Proposal'
  }
};

export function applyLanguage(language) {
  const chosen = copy[language] ? language : 'zh';
  const dictionary = copy[chosen];
  document.documentElement.lang = chosen === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dataset.language = chosen;
  document.title = dictionary.title;
  document.querySelectorAll('[data-copy]').forEach(el => {
    const value = dictionary[el.dataset.copy];
    if (typeof value === 'string') el.textContent = value;
  });
  const toggle = document.getElementById('language');
  toggle.textContent = chosen === 'zh' ? 'EN' : '中';
  toggle.setAttribute('aria-label', chosen === 'zh' ? 'Switch to English' : '切换为中文');
  document.getElementById('tear-range').setAttribute('aria-label', dictionary.tearAria);
  document.getElementById('begin-stamp').setAttribute('aria-label', dictionary.beginAria);
  document.querySelector('.invitation').setAttribute('aria-label', dictionary.arrivalAria);
  document.querySelector('#contents nav').setAttribute('aria-label', dictionary.menuAria);
  return chosen;
}
