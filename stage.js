// ===== 스테이지 작성법 =====
// title      : 게임 제목
// people     : 인물 이름 목록 = 격자의 열 (왼쪽부터)
// avatars    : (선택) 인물 얼굴 대신 쓸 그림 파일. people과 같은 순서·같은 개수
// reveal     : (선택) 다 맞힌 뒤 축하 화면에서 people 밑에 알려 줄 진짜 이름. people과 같은 순서·같은 개수
// categories : 속성 목록 = 격자의 행 (위부터). name = 행 이름, options = 팝업 선택지
//              label: true면 정답 칸에도 그림 밑에 이름을 씀
//              (선택지는 인물 수보다 많아도 됨 = 함정)
// answer     : answer[행][열] = 정답. 반드시 그 행 options 안의 값
// givens     : 처음부터 채워 둘 칸 [행, 열]  (행·열 번호는 0부터 셈)
// locks      : 잠긴 칸. cell = [행, 열], at = 맞힌 칸이 이 수 이상이면 열림
// clues      : 단서. text = 문장, at = 맞힌 칸이 이 수 이상이면 공개 (0 = 처음부터)
//              cells = 이 단서로 알아내는 칸 [[행, 열], ...]. 이 칸들이 다 맞으면 단서가 자동 체크됨
// images     : (선택) 값 → 그림 파일. 그림은 images 폴더에 넣음. 적지 않은 값은 글자만 보임
// submitUrl  : (선택) 다 맞힌 뒤 응모 내용을 보낼 구글 시트 웹 앱 주소 (구글시트_설치안내.md 참고).
//              비워 두면 응모 칸이 나오지 않음
// classesPerGrade : 학년별 반 수 [1학년, 2학년, ...]. 응모 칸의 반 선택 목록을 만듦 (submitUrl이 있으면 필요)
// submitNotice : 응모 칸 아래 개인정보 안내 문구
// ※ 하트는 3개로 고정이라 여기서 정하지 않음
const STAGE = {
  title: "돌아온 세교퀴즈",
  people: ["장소 1", "장소 2", "장소 3", "장소 4"],   // 어디인지는 학생이 단서로 짐작
  avatars: ["images/place-field.svg", "images/place-solbitchae.svg", "images/place-council.svg", "images/place-library.svg"],   // 얼굴 대신 장소 그림
  reveal: ["운동장", "솔빛채", "학생자치회실", "꿈드리 도서관"],   // 다 맞힌 뒤 축하 화면에서 알려 줄 진짜 이름 (people 순서)
  categories: [
    { name: "크기", options: ["3등", "1등", "4등", "2등"], label: true },   // label: 칸에도 그림 밑에 이름을 씀
    { name: "볼 수 있는 것", options: ["의장봉", "책", "학교기", "피구공"] },
    { name: "행사", options: ["연체 지우개", "학생 회의", "발표회", "아침 뽐내기"] },
    { name: "기억할 해", options: ["2013", "2026", "2018", "1997"] },
  ],
  // answer[행][열] = 정답
  answer: [
    ["1등", "2등", "4등", "3등"],
    ["학교기", "피구공", "의장봉", "책"],
    ["아침 뽐내기", "발표회", "학생 회의", "연체 지우개"],
    ["1997", "2018", "2026", "2013"],
  ],
  givens: [[1, 3]],                  // 시작 칸 [행, 열]
  locks: [
    { cell: [2, 0], at: 11 },        // 맞힌 칸 11개 이상이면 열림
    { cell: [3, 3], at: 14 },
  ],
  clues: [
    { text: "장소 2는 2018년에 지어진 다목적 체육관으로, 우리 학교에서 크기 2등이에요", at: 0, cells: [[0, 1], [3, 1]] },
    { text: "우리 학교가 문을 연 1997년을 기억할 해로 가진 곳은 크기 1등이에요", at: 0, cells: [[0, 0]] },
    { text: "장소 3은 장소 4보다 작아요", at: 0, cells: [[0, 2], [0, 3]] },
    { text: "장소 1에서는 우리 학교의 학교기가 펄럭여요", at: 3, cells: [[1, 0]] },
    { text: "학교기가 펄럭이는 곳의 기억할 해는 학교가 문을 연 1997이에요", at: 4, cells: [[3, 0]] },
    { text: "의장봉은 크기 4등인 곳에 있어요", at: 6, cells: [[1, 2], [1, 1]] },
    { text: "피구공으로 피구를 하는 곳에서 발표회가 열려요", at: 7, cells: [[2, 1]] },
    { text: "학생 회의는 의장봉이 있는 곳에서 열려요", at: 8, cells: [[2, 2]] },
    { text: "강종연 선생님께서 운영하는 학생자치회는 2026년에 생겼고, 장소 3에서 활동해요", at: 9, cells: [[3, 2]] },
    { text: "아침 뽐내기는 책이 있는 곳에서 열리지 않아요", at: 10, cells: [[2, 3]] },
    { text: "지금의 꿈드리 도서관은 2013년에 새로 꾸며졌어요", at: 12, cells: [[3, 3]] },
  ],
  images: {                          // 기억할 해는 숫자라 그림 없이 글자 알약으로 보임
    "1등": "images/size-1.svg",       // 크기: 땅 조각 4개
    "2등": "images/size-2.svg",       // 3개
    "3등": "images/size-3.svg",       // 2개
    "4등": "images/size-4.svg",       // 1개
    "학교기": "images/school-flag.svg",
    "피구공": "images/dodgeball.svg",
    "의장봉": "images/gavel.svg",
    "책": "images/book.svg",
    "아침 뽐내기": "images/morning-stage.svg",
    "발표회": "images/stage-hall.svg",
    "학생 회의": "images/meeting.svg",
    "연체 지우개": "images/eraser.svg",
  },
  classesPerGrade: [2, 3, 5, 4, 5, 5],   // 1학년 2반까지, 2학년 3반까지, 3학년 5반, 4학년 4반, 5학년 5반, 6학년 5반 (2026학년도)
  submitUrl: "https://script.google.com/macros/s/AKfycbz_x0Cib2PzTywhUGOhNDVURlebGGBWbbS3KZxkYiWe3rnTOL63d4qahE2jugc7C_qo/exec",
  submitNotice: "적은 내용은 행사 추첨에만 쓰고, 행사가 끝나면 지워요.",
};
