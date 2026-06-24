# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 실행

별도 빌드 없이 `index.html`을 브라우저에서 직접 열면 됩니다. Tailwind는 CDN으로 로드됩니다.

## 아키텍처

이 프로젝트는 두 개의 독립된 레이어로 구성됩니다.

**프론트엔드 (`index.html` + `script.js` + `style.css`)**
- 글 목록과 삭제는 `localStorage`만 사용합니다. GAS에 별도 조회 API가 없기 때문입니다.
- 글 등록 시에만 GAS로 POST 요청을 보냅니다(`sendToSheet`).
- 다크 모드는 Tailwind `class` 전략으로 구현됩니다. `<html>`에 `dark` 클래스를 토글하며, 깜빡임 방지를 위해 `index.html` `<head>` 안 인라인 스크립트에서 렌더 전에 클래스를 선적용합니다.
- 게시글 카드는 `renderPosts()`에서 DOM으로 동적 생성됩니다. Tailwind `dark:` 변형 클래스를 인라인 문자열에 포함하므로, 스타일 수정 시 `script.js`의 `li.innerHTML` 템플릿도 함께 수정해야 합니다.

**백엔드 (`Code.gs` — Google Apps Script)**
- `doPost(e)`만 존재합니다. 조회·삭제 엔드포인트는 없습니다.
- 받는 JSON 키는 반드시 `'제목'`, `'이름'`, `'내용'`(한글)이어야 합니다. `script.js`의 `sendToSheet`에서 프론트 내부 필드명(`title`, `author`, `content`)을 이 키로 매핑합니다.
- `Code.gs`를 수정했다면 Apps Script 콘솔에서 **새 배포**를 생성해야 합니다. 기존 배포를 덮어쓰면 URL이 유지됩니다.

## GAS URL 관리

`script.js` 1번째 줄의 `GAS_URL` 상수에 배포 URL이 하드코딩되어 있습니다. URL을 교체할 때는 이 값만 수정하면 됩니다.
