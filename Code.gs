// 데이터를 저장할 시트 이름
const SHEET_NAME = 'posts';

/**
 * 시트를 가져오는 함수.
 * 시트가 없으면 새로 만들고 헤더 행을 추가한다.
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // 첫 번째 행에 컬럼 헤더 추가
    sheet.appendRow(['제목', '이름', '내용', '작성일시']);
    sheet.setFrozenRows(1); // 헤더 행 고정
  }

  return sheet;
}

/**
 * HTTP POST 요청을 받아 스프레드시트에 데이터를 저장하는 함수.
 *
 * 프론트엔드에서 아래 형식의 JSON을 body로 전송해야 한다:
 * {
 *   "제목": "공지사항",
 *   "이름": "홍길동",
 *   "내용": "안녕하세요!"
 * }
 */
function doPost(e) {
  try {
    // 1. 요청 body에서 JSON 파싱
    const data = JSON.parse(e.postData.contents);

    // 2. 필수 필드 유효성 검사
    const 제목 = (data['제목'] || '').toString().trim();
    const 이름 = (data['이름'] || '').toString().trim();
    const 내용 = (data['내용'] || '').toString().trim();

    if (!제목 || !이름 || !내용) {
      return buildResponse({ ok: false, error: '제목, 이름, 내용은 모두 필수입니다.' });
    }

    // 3. 작성 시각 (KST: UTC+9)
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const 작성일시 = Utilities.formatDate(kst, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    // 4. 시트에 한 행 추가
    const sheet = getSheet();
    sheet.appendRow([제목, 이름, 내용, 작성일시]);

    // 5. 성공 응답 반환
    return buildResponse({ ok: true, message: '저장되었습니다.' });

  } catch (err) {
    // 예상치 못한 오류 처리
    return buildResponse({ ok: false, error: err.message });
  }
}

/**
 * JSON 응답 객체를 만들어 반환하는 헬퍼 함수.
 * ContentService를 통해 MIME 타입을 JSON으로 설정한다.
 */
function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
