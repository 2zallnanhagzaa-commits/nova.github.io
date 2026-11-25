export const web = 'https://novachat.cyou';

export const downloads = [
  { name: 'Windows', icon: 'windows', release: null },
  { name: 'Android', icon: 'android', release: null },
  { name: 'macOS', icon: 'apple', release: null },
  { name: 'iOS', icon: 'phone', release: null }
];

// 실제 배포 후 { version: '1.0.0', date: '2026-01-01', notes: ['변경 내용'] } 형식으로 추가합니다.
export const updates = [];

// 운영팀이 확인한 상태만 기록합니다. state는 operational, degraded, maintenance 중 하나입니다.
export const status = { state: null, checkedAt: null, message: '' };
