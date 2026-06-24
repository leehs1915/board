# 학생 게시판

Tailwind CSS 기반의 심플한 게시판 웹 앱입니다.  
글 작성 시 Google Apps Script를 통해 Google 스프레드시트에 자동 저장됩니다.

## 주요 기능

- 글 작성 / 삭제
- 작성자 이니셜 아바타 (이름별 고유 색상)
- 상대 시각 표시 (방금 전 / N분 전 / N시간 전)
- 다크 모드 토글 (시스템 설정 자동 감지 + 수동 전환)
- Google 스프레드시트 연동 (Google Apps Script)
- localStorage로 새로고침 후에도 목록 유지

## 파일 구조

```
students-board/
├── index.html   # UI 마크업 (Tailwind CDN)
├── style.css    # 커스텀 스타일 (hover 효과, 스크롤바 등)
├── script.js    # 프론트엔드 로직 + GAS API 호출
└── Code.gs      # Google Apps Script 백엔드
```

## 시작하기

### 1. Google Apps Script 배포

1. [Google Drive](https://drive.google.com)에서 새 스프레드시트 생성
2. 메뉴 → **확장 프로그램** → **Apps Script**
3. `Code.gs` 내용을 에디터에 붙여넣고 저장
4. **배포** → **새 배포** 클릭
   - 유형: `웹 앱`
   - 실행 계정: `나`
   - 액세스 권한: `모든 사용자`
5. 배포 후 생성된 **웹 앱 URL** 복사

### 2. GAS URL 설정

`script.js` 1번째 줄의 `GAS_URL`에 복사한 URL을 붙여넣습니다.

```js
const GAS_URL = 'https://script.google.com/macros/s/.../exec';
```

### 3. 실행

`index.html`을 브라우저에서 열면 바로 동작합니다. (별도 서버 불필요)

## 데이터 흐름

```
글 등록
  ├─→ GAS doPost → 스프레드시트에 저장 (제목 / 이름 / 내용 / 작성일시)
  └─→ localStorage → 목록 즉시 렌더링

삭제 / 목록 표시
  └─→ localStorage만 사용
```

## 스프레드시트 저장 형식

| 제목 | 이름 | 내용 | 작성일시 |
|------|------|------|----------|
| 공지사항 | 홍길동 | 안녕하세요! | 2026-06-24 13:45:00 |

## 기술 스택

- HTML / CSS / JavaScript (Vanilla)
- [Tailwind CSS](https://tailwindcss.com) (CDN)
- Google Apps Script
