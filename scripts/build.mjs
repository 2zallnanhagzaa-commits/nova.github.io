import { cp, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { downloads, status, updates, web } from '../src/content.mjs';

const root = new URL('../', import.meta.url);
const staging = new URL('.dist-build/', root);
const dist = new URL('dist/', root);
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const icons = {
  spark: '<path d="M12 1.5c1.3 6.3 4.2 9.2 10.5 10.5-6.3 1.3-9.2 4.2-10.5 10.5C10.7 16.2 7.8 13.3 1.5 12 7.8 10.7 10.7 7.8 12 1.5Z" fill="currentColor" stroke="none"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  chat: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.6-3.4A7.5 7.5 0 1 1 20 11.5Z"/><path d="M9 12h6"/>',
  screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"/>',
  theme: '<path d="M20.5 15A8.8 8.8 0 0 1 9 3.5 9 9 0 1 0 20.5 15Z"/>',
  windows: '<path d="M3 5l8-1v7H3zm10-1 8-1v8h-8zM3 13h8v7l-8-1zm10 0h8v8l-8-1z" fill="currentColor" stroke="none"/>',
  apple: '<path d="M15 7c-1.2 0-2.1.7-3 .7S10.2 7 9 7c-2.7 0-4.5 2.2-4.5 5 0 4 2.7 8 4.8 8 1 0 1.6-.6 2.7-.6s1.7.6 2.7.6c1.6 0 3.5-2.4 4.3-5a4.4 4.4 0 0 1-.7-7A4.4 4.4 0 0 0 15 7zm-3-1c0-2 1.5-3.5 3.5-4 0 2-1.5 3.5-3.5 4Z"/>',
  pulse: '<path d="M2 12h5l3-7 4 14 3-7h5"/>'
};
const icon = (name) => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
const brand = (prefix) => `<img class="brand-icon" src="${prefix}assets/nova-logo.png" alt="" width="36" height="36"> NOVA`;
const start = `<a class="button primary" href="${web}">${icon('globe')} 웹에서 NOVA 시작하기</a>`;
const nav = [['features','주요 기능'],['download','다운로드'],['updates','업데이트'],['story','개발 스토리'],['guide','가이드'],['status','서비스 상태']];
const intro = (en, title, text) => `<header class="page-intro"><p class="eyebrow">${en}</p><h1>${title}</h1><p>${text}</p></header>`;
const card = (glyph, title, description) => `<article class="card"><span class="tile-icon">${icon(glyph)}</span><h3>${title}</h3><p>${description}</p></article>`;
const features = [
  ['chat', '웹 채팅', 'NOVA 웹 서비스에서 대화를 시작할 수 있습니다.'],
  ['globe', '브라우저에서 바로', 'PC, 모바일, 크롬북에서 브라우저로 NOVA에 접속하세요.'],
  ['download', '플랫폼별 다운로드', 'Windows와 macOS 앱의 배포 여부를 확인하세요.']
];
const featureCards = `<div class="cards">${features.map((item) => card(...item)).join('')}</div>`;

function layout(key, title, description, body, prefix) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#6478FF">
  <title>${title}</title>
  <link rel="icon" href="${prefix}assets/nova-logo.png" type="image/png">
  <script src="${prefix}assets/theme.js"></script>
  <link rel="stylesheet" href="${prefix}assets/site.css">
  <script defer src="${prefix}assets/site.js"></script>
</head>
<body>
  <a class="skip" href="#main">본문으로 건너뛰기</a>
  <header class="top"><div class="shell top-inner">
    <a class="brand" href="${prefix}">${brand(prefix)}</a>
    <nav aria-label="주 메뉴">${nav.map(([slug, label]) => `<a href="${prefix}${slug}/"${key === slug ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <button hidden type="button" id="theme" class="theme" aria-label="다크 모드" title="다크 모드">${icon('theme')}</button>
  </div></header>
  <main id="main" class="shell">${body}</main>
  <footer class="footer"><div class="shell footer-inner"><a class="brand" href="${prefix}">${brand(prefix)}</a><span>간단하게, 깔끔하게, 확실하게.</span><a href="${web}">novachat.cyou</a></div></footer>
</body>
</html>`;
}

const home = `<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow"><span class="mini-mark">${icon('spark')}</span> NOVA CHAT</p>
    <h1>대화를 더<br><em>간단하게.</em></h1>
    <p>브라우저에서 바로 시작하는 채팅 서비스, NOVA.</p>
    <div class="actions">${start}<a class="button secondary" href="./download/">${icon('download')} 다운로드</a></div>
  </div>
  <figure class="hero-art">
    <div class="orbit orbit-outer"></div><div class="orbit orbit-inner"></div>
    <div class="star star-one">${icon('spark')}</div><div class="star star-two">${icon('spark')}</div>
    <img class="chat-preview" src="./assets/chat-preview-sidebar.webp" width="2048" height="1007" alt="NOVA 사이드바와 채팅 예시 채널의 인사 및 환영 메시지">
    <figcaption>대화 화면 예시</figcaption>
  </figure>
</section>
<section class="home-features" aria-labelledby="features-title"><p class="eyebrow">FEATURES</p><h2 id="features-title">NOVA 주요 기능</h2>${featureCards}</section>`;

function releaseLink(platform) {
  if (!platform.release) return '<span class="badge">출시 준비 중</span>';
  const { url, version } = platform.release;
  if (!version || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/releases\/download\/[^/?#]+\/[^/?#]+$/.test(url)) {
    throw new Error(`GitHub Releases 다운로드 주소 또는 버전이 잘못되었습니다. (${platform.name})`);
  }
  return `<a class="button primary" href="${escape(url)}">${icon('download')} ${escape(platform.name)} 다운로드</a><p>버전 ${escape(version)}</p>`;
}

const states = { operational: '정상 운영', degraded: '장애 발생', maintenance: '점검 중' };
if (status.state && (!Object.hasOwn(states, status.state) || !status.checkedAt || !Number.isFinite(Date.parse(status.checkedAt)))) {
  throw new Error('서비스 상태와 확인 시각을 확인하세요.');
}
const checkedAt = status.state ? new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Seoul'
}).format(new Date(status.checkedAt)) : '';
const releaseDate = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeZone: 'UTC' });
const pages = {
  '': ['NOVA 공식 홈페이지', 'NOVA 소개와 이용 안내, 플랫폼별 다운로드 소식을 확인하세요.', home],
  features: ['주요 기능', 'NOVA 웹 채팅과 기기별 이용 방법을 알아보세요.',
    intro('FEATURES', '주요 기능', '브라우저를 열고 NOVA에서 대화를 시작하세요.') + featureCards +
    `<aside class="panel"><h2>크롬북에서 사용하기</h2><p>Chrome에서 NOVA 웹 서비스를 열어 이용할 수 있습니다.</p>${start}</aside>`],
  download: ['다운로드', '운영체제별 NOVA 앱 출시 상태를 확인하세요.',
    intro('DOWNLOAD', '다운로드', '사용하는 운영체제에 맞는 NOVA 앱을 확인하세요.') +
    `<div class="cards platforms">${downloads.map((platform) => `<article class="card"><span class="tile-icon">${icon(platform.icon)}</span><h2>${escape(platform.name)}</h2>${releaseLink(platform)}</article>`).join('')}</div>
    <aside class="panel"><h2>설치 없이 이용하기</h2><p>PC와 모바일, 크롬북에서는 브라우저로 NOVA를 열 수 있습니다.</p>${start}</aside>`],
  updates: ['업데이트', 'NOVA의 버전별 업데이트 내역을 확인하세요.',
    intro('RELEASE NOTES', '업데이트 내역', '버전별 변경 사항을 확인하세요.') +
    (updates.length ? `<div class="stack">${[...updates].sort((first, second) => second.date.localeCompare(first.date)).map((update) =>
      `<article class="card"><time datetime="${escape(update.date)}">${releaseDate.format(new Date(update.date))}</time><h2>${escape(update.version)}</h2><ul>${update.notes.map((note) => `<li>${escape(note)}</li>`).join('')}</ul></article>`).join('')}</div>` :
      '<section class="panel"><h2>등록된 업데이트 내역이 없습니다</h2><p>공개된 버전의 변경 사항이 등록되면 여기에 표시됩니다.</p></section>')],
  story: ['개발 스토리', 'NOVA의 개발 철학과 프로젝트의 진행 과정을 살펴보세요.',
    intro('OUR STORY', 'NOVA 개발 스토리', 'NOVA가 추구하는 개발 원칙과 프로젝트의 진행 과정입니다.') +
    `<blockquote class="quote">간단하게, 깔끔하게, 확실하게.</blockquote>
    <section class="story"><h2>개발 타임라인</h2><ol class="timeline">
      <li><span>웹 서비스</span><h3>NOVA 웹 채팅</h3><p>novachat.cyou에서 NOVA 웹 채팅을 제공합니다.</p></li>
      <li><span>소개 사이트</span><h3>NOVA 공식 홈페이지 제작</h3><p>서비스 소개, 이용 가이드, 다운로드 정보를 한 곳에서 볼 수 있도록 구성했습니다.</p></li>
      <li><span>출시 준비</span><h3>플랫폼별 앱 배포 준비</h3><p>앱이 출시되면 플랫폼별 다운로드 페이지에서 배포 파일을 안내합니다.</p></li>
    </ol></section>`],
  guide: ['사용자 가이드', '웹에서 NOVA를 열고 접속 문제를 해결하는 방법입니다.',
    intro('USER GUIDE', '사용자 가이드', '웹에서 NOVA를 시작하는 방법을 안내합니다.') +
    `<div class="stack">
      <section class="card"><h2>웹에서 시작하기</h2><ol><li>PC, 모바일 또는 크롬북의 브라우저를 엽니다.</li><li>아래 버튼을 눌러 NOVA에 접속합니다.</li><li>서비스 화면의 안내에 따라 대화를 시작합니다.</li></ol>${start}</section>
      <section class="card"><h2>접속이 어려울 때</h2><p>인터넷 연결을 확인하고 브라우저에서 페이지를 새로고침하세요. 문제가 계속되면 서비스 상태 페이지에서 게시된 공지를 확인하세요.</p><a class="text-link" href="../status/">서비스 상태 보기</a></section>
      <section class="card"><h2>앱 출시 확인하기</h2><p>플랫폼별 앱의 배포 여부는 다운로드 페이지에서 확인할 수 있습니다.</p><a class="text-link" href="../download/">다운로드 페이지 보기</a></section>
    </div>`],
  status: ['서비스 상태', 'NOVA 웹 서비스의 상태와 운영 공지를 확인하세요.',
    intro('SERVICE STATUS', '서비스 상태', 'NOVA 웹 서비스의 운영 공지를 확인할 수 있습니다.') +
    `<section class="card status-card"><span class="tile-icon">${icon('pulse')}</span><div><h2>NOVA 웹 서비스</h2>
      <p class="badge">${status.state ? states[status.state] : '상태 정보 미등록'}</p>
      <p>${status.state ? `마지막 확인 <time datetime="${escape(status.checkedAt)}">${checkedAt} (한국시간)</time>` : '게시된 상태 정보가 없습니다. 실시간 모니터링은 제공하지 않습니다.'}</p>
      ${status.message ? `<p>${escape(status.message)}</p>` : ''}${start}</div></section>`]
};

await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await cp(new URL('src/assets/', root), new URL('assets/', staging), { recursive: true });
for (const [slug, [title, description, body]] of Object.entries(pages)) {
  const folder = slug ? new URL(`${slug}/`, staging) : staging;
  await mkdir(folder, { recursive: true });
  await writeFile(new URL('index.html', folder), layout(slug, slug ? `${title} | NOVA` : title, description, body, slug ? '../' : './'));
}
await writeFile(new URL('.nojekyll', staging), '');
await rm(dist, { recursive: true, force: true });
await rename(staging, dist);
console.log(`정적 페이지 ${Object.keys(pages).length}개 생성 완료`);
