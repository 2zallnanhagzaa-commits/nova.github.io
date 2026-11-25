import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { downloads, status, updates, web } from '../src/content.mjs';

const dist = new URL('../dist/', import.meta.url);
const base = new URL('https://owner.github.io/nova-website/');
const pages = ['', 'features/', 'download/', 'updates/', 'story/', 'guide/', 'status/'];

test('GitHub Pages 프로젝트 경로에서 페이지와 자산을 찾을 수 있다', async () => {
  for (const page of pages) {
    const html = await readFile(new URL(`${page}index.html`, dist), 'utf8');
    assert.match(html, /<html lang="ko">/);
    assert.equal([...html.matchAll(/<h1>/g)].length, 1);
    assert.match(html, /href="https:\/\/novachat\.cyou"/);
    for (const [, path] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https:|#)/.test(path)) continue;
      const resolved = new URL(path, new URL(page, base));
      assert.ok(resolved.href.startsWith(base.href), `잘못된 링크: ${page} → ${path}`);
      const relative = resolved.pathname.slice(base.pathname.length);
      const filename = !relative || relative.endsWith('/') ? `${relative}index.html` : relative;
      assert.ok((await stat(new URL(filename, dist))).isFile(), filename);
    }
  }
});

test('실제 릴리스가 있는 운영체제에만 다운로드 링크를 제공한다', async () => {
  const html = await readFile(new URL('download/index.html', dist), 'utf8');
  for (const platform of downloads) {
    const card = [...html.matchAll(/<article class="card">([\s\S]*?)<\/article>/g)]
      .map((match) => match[1]).find((content) => content.includes(`<h2>${platform.name}</h2>`));
    assert.ok(card, platform.name);
    if (platform.release) {
      assert.ok(card.includes(platform.release.url));
    } else {
      assert.ok(card.includes('출시 준비 중'));
      assert.doesNotMatch(card, /<a\s/);
    }
  }
});

test('미등록 상태와 업데이트는 빈 상태로 표시하며 웹 서비스로 연결한다', async () => {
  const statusPage = await readFile(new URL('status/index.html', dist), 'utf8');
  const updatesPage = await readFile(new URL('updates/index.html', dist), 'utf8');
  assert.ok(statusPage.includes(web));
  if (!status.state) assert.match(statusPage, /상태 정보 미등록/);
  if (!updates.length) assert.match(updatesPage, /등록된 업데이트 내역이 없습니다/);
});
