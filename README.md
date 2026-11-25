# NOVA 공식 홈페이지

[novachat.cyou](https://novachat.cyou)의 서비스 소개, 앱 다운로드, 업데이트, 개발 스토리, 가이드와 상태 정보를 담는 독립 정적 사이트입니다. Node.js 22 이상에서 외부 패키지 설치 없이 빌드할 수 있습니다.

```sh
npm run build
npm test
npm run dev
```

빌드 결과는 `dist/`에 생성됩니다. 개발 미리보기 기본 주소는 `http://localhost:3000`입니다.

## 콘텐츠 관리

`src/content.mjs`에서 다음 정보를 관리합니다.

- **다운로드** — 실제 출시 후 해당 운영체제의 `release`를 `{ version, url }`로 채웁니다. `url`에는 GitHub Releases에서 공개된 에셋의 직접 다운로드 주소를 사용합니다. `null`이면 출시 준비 중으로 표시됩니다.
- **업데이트** — `updates`에 `{ version, date, notes }`를 추가합니다. 날짜는 `YYYY-MM-DD`, 변경 사항은 문자열 배열입니다. 최신 날짜부터 표시됩니다.
- **서비스 상태** — 운영팀에서 확인한 `state`, 시간대가 포함된 ISO 8601 형식의 `checkedAt`, 공지 문구 `message`를 입력합니다. 상태는 `operational`, `degraded`, `maintenance` 중 하나입니다. 페이지는 게시 시점의 기록을 표시합니다.
- **개발 타임라인** — 확인된 이력은 `scripts/build.mjs`의 스토리 페이지에 추가합니다.

## GitHub Pages 배포

소유자 승인 후 새 `nova-website` 저장소에 이 소스를 올립니다. 저장소 설정의 **Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다. **Actions → NOVA GitHub Pages → Run workflow**에서 기본 브랜치로 수동 실행합니다. 워크플로가 빌드와 테스트를 마친 뒤 `dist/`를 배포하고 Pages 주소를 출력합니다. 프로젝트 주소에는 보통 `/nova-website/` 경로가 포함됩니다.

콘텐츠를 수정한 뒤 같은 워크플로를 수동 실행하면 게시본이 갱신됩니다.
