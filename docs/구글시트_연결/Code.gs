// 추리 퍼즐 응모 받기 — 구글 시트의 [확장 프로그램 > Apps Script]에 그대로 붙여 넣기
// 게임이 보낸 학년·반·번호·이름·이유를 "응모" 시트에 한 줄씩 적는다.

const SHEET_NAME = "응모";
const HEADER = ["제출 시각", "학년", "반", "번호", "이름", "뽑혀야 하는 이유"];

// 주소를 브라우저로 열면 보이는 확인용 응답 (시트에는 아무것도 쓰지 않음)
function doGet() {
  return reply({ ok: true, message: "응모 받을 준비 완료" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 여러 명이 동시에 보내도 줄이 겹치지 않게
  try {
    const data = JSON.parse(e.postData.contents);
    const row = [
      new Date(),
      clean(data.grade, 1),
      clean(data.klass, 2),
      clean(data.number, 2),
      clean(data.name, 10),
      clean(data.reason, 100),
    ];
    if (row.slice(1).some(function (v) { return v === ""; })) {
      return reply({ ok: false, error: "빈 칸이 있어요" });
    }
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADER);
    sheet.appendRow(row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 줄바꿈 정리, 글자 수 제한, = + - @ 로 시작하면 수식으로 실행되지 않게 앞에 ' 를 붙임
function clean(value, maxLength) {
  const text = String(value == null ? "" : value).replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
