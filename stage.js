// ===== 스테이지 작성법 =====
// title      : 게임 제목
// people     : 인물 이름 목록 = 격자의 열 (왼쪽부터)
// categories : 속성 목록 = 격자의 행 (위부터). name = 행 이름, options = 팝업 선택지
//              (선택지는 인물 수보다 많아도 됨 = 함정)
// answer     : answer[행][열] = 정답. 반드시 그 행 options 안의 값
// givens     : 처음부터 채워 둘 칸 [행, 열]  (행·열 번호는 0부터 셈)
// locks      : 잠긴 칸. cell = [행, 열], at = 맞힌 칸이 이 수 이상이면 열림
// clues      : 단서. text = 문장, at = 맞힌 칸이 이 수 이상이면 공개 (0 = 처음부터)
//              cells = 이 단서로 알아내는 칸 [[행, 열], ...]. 이 칸들이 다 맞으면 단서가 자동 체크됨
// images     : (선택) 값 → 그림 파일. 그림은 images 폴더에 넣음. 적지 않은 값은 글자만 보임
// submitUrl  : (선택) 다 맞힌 뒤 응모 내용을 보낼 구글 시트 웹 앱 주소 (구글시트_설치안내.md 참고).
//              비워 두면 응모 칸이 나오지 않음
// submitNotice : 응모 칸 아래 개인정보 안내 문구
// ※ 하트는 3개로 고정이라 여기서 정하지 않음
const STAGE = {
  title: "우리 반 친구들의 비밀",
  people: ["민준", "서연", "지호"],
  categories: [
    { name: "좋아하는 과목", options: ["수학", "체육", "음악", "미술"] },
    { name: "반려동물", options: ["고양이", "강아지", "햄스터"] },
  ],
  // answer[행][열] = 정답
  answer: [
    ["수학", "체육", "음악"],
    ["고양이", "강아지", "햄스터"],
  ],
  givens: [[0, 0]],                  // 시작 칸 [행, 열]
  locks: [{ cell: [1, 0], at: 5 }],  // 맞힌 칸 5개 이상이면 열림
  clues: [
    { text: "체육을 좋아하는 친구는 가운데에 있어요", at: 0, cells: [[0, 1]] },
    { text: "음악을 좋아하는 친구는 오른쪽 끝에 있어요", at: 0, cells: [[0, 2]] },
    { text: "강아지를 키우는 친구는 체육을 좋아해요", at: 0, cells: [[1, 1]] },
    { text: "지호는 고양이를 키우지 않아요", at: 3, cells: [[1, 2]] },
  ],
  images: {
    "수학": "images/math.svg",
    "체육": "images/pe.svg",
    "음악": "images/music.svg",
    "미술": "images/art.svg",
    "고양이": "images/cat.svg",
    "강아지": "images/dog.svg",
    "햄스터": "images/hamster.svg",
  },
  submitUrl: "https://script.google.com/macros/s/AKfycbz_x0Cib2PzTywhUGOhNDVURlebGGBWbbS3KZxkYiWe3rnTOL63d4qahE2jugc7C_qo/exec",
  submitNotice: "적은 내용은 행사 추첨에만 쓰고, 행사가 끝나면 지워요.",
};
