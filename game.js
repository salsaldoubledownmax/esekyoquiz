const HEARTS = 3;
const ROWS = STAGE.categories.length;
const COLS = STAGE.people.length;

const HEART_SVG =
  '<svg class="heart" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 21.2s-7.6-4.7-10-9.4C.3 8.3 2.4 3.8 6.4 3.8c2.4 0 3.9 1.3 5.6 3.3 1.7-2 3.2-3.3 5.6-3.3 4 0 6.1 4.5 4.4 8C19.6 16.5 12 21.2 12 21.2z"/>' +
  '<ellipse class="shine" cx="7" cy="8.5" rx="2" ry="1.3" transform="rotate(-30 7 8.5)"/>' +
  "</svg>";

// 인물 캐릭터: 열 번호에 따라 머리색·머리 모양·배경색이 달라짐
const HAIR_COLORS = ["#4a3b33", "#b8733d", "#2f2f3a", "#e0a84a", "#7a4a36"];
const AVATAR_BGS = ["#ffd9e2", "#d6ecff", "#fff1c2", "#dcf5d2", "#eadcff"];
const HAIR_STYLES = [
  // 짧은 머리
  { back: "", top: "M9 25C9 12 17 7 24 7s15 5 15 18c-4-6-9-8-15-8s-11 2-15 8z" },
  // 단발
  { back: "M9 25C9 11 17 6 24 6s15 5 15 19v10c-2 0-3-2-3-4v-9c-5-5-19-5-24 0v9c0 2-1 4-3 4z", top: "M10 22c2-9 8-13 14-13s12 4 14 13c-4-4-9-5-14-5s-10 1-14 5z" },
  // 양갈래
  { back: '<circle cx="8" cy="24" r="5"/><circle cx="40" cy="24" r="5"/>', top: "M9 25C9 12 17 7 24 7s15 5 15 18c-4-6-9-8-15-8s-11 2-15 8z" },
  // 똥머리
  { back: '<circle cx="24" cy="6" r="5.5"/>', top: "M9 25C9 13 17 9 24 9s15 4 15 16c-4-6-9-8-15-8s-11 2-15 8z" },
];

function avatarSVG(i) {
  // stage.js의 avatars가 있으면 얼굴 대신 그 그림(예: 장소 그림)을 동그라미 안에
  if (STAGE.avatars && STAGE.avatars[i]) {
    return `<img class="avatar" src="${STAGE.avatars[i]}" alt="" style="background:${AVATAR_BGS[i % AVATAR_BGS.length]}">`;
  }
  const hair = HAIR_COLORS[i % HAIR_COLORS.length];
  const style = HAIR_STYLES[i % HAIR_STYLES.length];
  const back = style.back.startsWith("<") ? style.back : style.back ? `<path d="${style.back}"/>` : "";
  return (
    `<svg class="avatar" viewBox="0 0 48 48" aria-hidden="true" style="background:${AVATAR_BGS[i % AVATAR_BGS.length]}">` +
    `<g stroke="#4a3b33" stroke-width="2.2" stroke-linejoin="round" fill="${hair}">${back}</g>` +
    '<circle cx="24" cy="27" r="15" fill="#ffe2cc" stroke="#4a3b33" stroke-width="2.2"/>' +
    `<path d="${style.top}" fill="${hair}" stroke="#4a3b33" stroke-width="2.2" stroke-linejoin="round"/>` +
    '<circle cx="19" cy="28" r="1.9" fill="#4a3b33"/><circle cx="29" cy="28" r="1.9" fill="#4a3b33"/>' +
    '<ellipse cx="15.5" cy="32" rx="2.6" ry="1.6" fill="#ff9fa0"/><ellipse cx="32.5" cy="32" rx="2.6" ry="1.6" fill="#ff9fa0"/>' +
    '<path d="M21 33q3 3 6 0" fill="none" stroke="#4a3b33" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>"
  );
}

function imageOf(value) {
  return STAGE.images && STAGE.images[value];
}

// 칸 값: 그림이 있으면 그림(withLabel이면 + 작은 글자), 없으면 글자만
function valueHTML(value, withLabel) {
  const src = imageOf(value);
  if (!src) return `<span class="value-text">${value}</span>`;
  const label = withLabel ? `<span class="value-label">${value}</span>` : "";
  return `<img class="value-img" src="${src}" alt="${value}">${label}`;
}

// 그림 밑 이름이 한 줄에 안 들어가면 글씨를 조금씩 줄여 한 줄에 맞춤(최소 10px)
function fitLabels(root) {
  root.querySelectorAll(".value-label").forEach((label) => {
    label.style.fontSize = "";
    let size = parseFloat(getComputedStyle(label).fontSize);
    while (label.scrollWidth > label.clientWidth && size > 10) {
      size -= 0.5;
      label.style.fontSize = size + "px";
    }
  });
}

// 단서 문장 속 보기 이름: 그림 + 밑줄 + 행별 색
const KEYWORD_COLORS = ["#d9822b", "#2f9e8f", "#3f72b8", "#b8487a", "#6a8f2a"];

function escapeHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clueHTML(text) {
  const rowOf = {};
  STAGE.categories.forEach((cat, r) => cat.options.forEach((v) => (rowOf[v] ??= r)));
  const words = Object.keys(rowOf).sort((a, b) => b.length - a.length); // 긴 이름 먼저
  if (!words.length) return escapeHTML(text);
  const pattern = new RegExp(words.map((w) => escapeHTML(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  return escapeHTML(text).replace(pattern, (word) => {
    const src = imageOf(word);
    const img = src ? `<img class="kw-img" src="${src}" alt="">` : "";
    return `<span class="kw" style="color:${KEYWORD_COLORS[rowOf[word] % KEYWORD_COLORS.length]}">${img}<u>${word}</u></span>`;
  });
}

// ----- 효과음 -----
// 정답·오답·다 맞힘·폭죽은 sounds 폴더의 소리 파일. 원본이 커서 volume(0~1)으로 줄여서 냄
// (원본 평균 세기를 재서 네 소리가 비슷한 크기로 들리게 맞춤. 더 줄이려면 숫자를 작게)
// offset·length(초)가 있으면 그 부분만 냄 (wrong.mp3는 앞 0.65초가 조용해서 자르고, 0.5초만 낸 뒤 작아지며 끝)
// 나머지(톡·찰칵·또로롱)와, 파일을 아직 못 읽었을 때는 브라우저가 직접 만든 소리
const SOUND_FILES = {
  correct: { src: "sounds/correct.mp3", volume: 0.12 },
  wrong: { src: "sounds/wrong.mp3", volume: 0.12, offset: 0.65, length: 0.5 },
  clear: { src: "sounds/finale.mp3", volume: 0.6 },
  fireworks: { src: "sounds/confetti.mp3", volume: 0.8 },
};
const soundBuffers = {}; // kind → 읽어 둔 소리, 또는 "element"(file://로 열어 fetch가 안 될 때)
let audio;

// 처음 소리를 낼 때(시작하기 탭) 파일 네 개를 미리 읽어 둠
function loadSoundFiles() {
  Object.entries(SOUND_FILES).forEach(([kind, file]) => {
    fetch(file.src)
      .then((response) => response.arrayBuffer())
      .then((data) => audio.decodeAudioData(data))
      .then((buffer) => (soundBuffers[kind] = buffer))
      .catch(() => (soundBuffers[kind] = "element"));
  });
}

// 소리 파일로 냄. 아직 못 읽었으면 false (그때는 만든 소리로 대신)
function playFile(kind, start, delay) {
  const file = SOUND_FILES[kind];
  const buffer = file && soundBuffers[kind];
  if (!buffer) return false;
  const offset = file.offset || 0;
  if (buffer === "element") {
    const element = new Audio(file.src);
    element.volume = file.volume;
    element.currentTime = offset;
    setTimeout(() => element.play().catch(() => {}), delay * 1000);
    if (file.length) setTimeout(() => element.pause(), (delay + file.length) * 1000);
    return true;
  }
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(file.volume, start);
  source.connect(gain).connect(audio.destination);
  if (file.length) {
    // 끝 0.12초 동안 작아지며 끝남(뚝 끊기는 소리 없게)
    gain.gain.setValueAtTime(file.volume, start + file.length - 0.12);
    gain.gain.linearRampToValueAtTime(0, start + file.length);
    source.start(start, offset, file.length);
  } else {
    source.start(start, offset);
  }
  return true;
}

// 음 하나: freq Hz, start초에 시작해 length초 동안 작아지며 사라짐
function tone(freq, start, length, type, volume) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

// 펑: 짧은 잡음이 start초에 터져 length초 동안 작아짐 (폭죽 소리)
function pop(start, length, volume) {
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * length), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1200 + Math.random() * 1200;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start(start);
}

// tap = 칸·버튼을 누를 때 짧은 "톡", correct = 정답일 때 올라가는 "띠링", wrong = 오답일 때 내려가는 "뚜둥",
// unlock = 자물쇠가 열릴 때 "찰칵", line = 한 줄을 다 맞혔을 때 "또로롱", clear = 다 맞혔을 때 "빰빠밤",
// fireworks = 축하 화면 폭죽 "펑 펑". delay초 뒤에 남
function playSound(kind, delay = 0) {
  try {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      loadSoundFiles();
    }
    if (audio.state === "suspended") audio.resume();
    const t = audio.currentTime + delay;
    if (playFile(kind, t, delay)) return;
    if (kind === "tap") tone(880, t, 0.07, "triangle", 0.06);
    if (kind === "correct") {
      tone(784, t, 0.15, "sine", 0.09);
      tone(1047, t + 0.09, 0.15, "sine", 0.09);
      tone(1319, t + 0.18, 0.35, "sine", 0.09);
    }
    if (kind === "wrong") {
      tone(330, t, 0.16, "triangle", 0.12);
      tone(220, t + 0.14, 0.3, "triangle", 0.12);
    }
    if (kind === "unlock") {
      tone(1568, t, 0.05, "square", 0.025);
      tone(2093, t + 0.08, 0.1, "square", 0.025);
    }
    if (kind === "line") {
      [1047, 1319, 1568, 2093].forEach((freq, i) => tone(freq, t + i * 0.06, 0.12, "sine", 0.06));
    }
    if (kind === "clear") {
      tone(523, t, 0.14, "triangle", 0.08);
      tone(659, t + 0.13, 0.14, "triangle", 0.08);
      tone(784, t + 0.26, 0.14, "triangle", 0.08);
      tone(1047, t + 0.39, 0.6, "triangle", 0.08);
    }
    if (kind === "fireworks") {
      [0, 0.35, 0.55, 1.0, 1.3].forEach((at) => pop(t + at, 0.25, 0.08));
    }
  } catch (error) {
    // 소리를 못 내는 브라우저면 소리 없이 진행
  }
}

let state;

// ----- 데이터 검사 -----
function validateStage() {
  const errors = [];
  const inGrid = (cell) =>
    Array.isArray(cell) && cell[0] >= 0 && cell[0] < ROWS && cell[1] >= 0 && cell[1] < COLS;

  if (STAGE.answer.length !== ROWS) {
    errors.push(`answer의 줄 수(${STAGE.answer.length})가 categories 수(${ROWS})와 달라요.`);
  }
  STAGE.answer.forEach((row, r) => {
    if (row.length !== COLS) {
      errors.push(`answer ${r}번 줄의 값 개수(${row.length})가 people 수(${COLS})와 달라요.`);
    }
    const options = STAGE.categories[r] ? STAGE.categories[r].options : [];
    row.forEach((value, c) => {
      if (!options.includes(value)) {
        errors.push(`answer[${r}][${c}] "${value}"가 그 행의 options에 없어요.`);
      }
    });
  });
  STAGE.givens.forEach((cell) => {
    if (!inGrid(cell)) errors.push(`givens의 [${cell}]가 격자 밖이에요.`);
  });
  STAGE.locks.forEach((lock) => {
    if (!inGrid(lock.cell)) errors.push(`locks의 [${lock.cell}]가 격자 밖이에요.`);
    if (STAGE.givens.some((g) => g[0] === lock.cell[0] && g[1] === lock.cell[1])) {
      errors.push(`[${lock.cell}]가 givens와 locks에 둘 다 있어요.`);
    }
    if (lock.at > ROWS * COLS - STAGE.locks.length) {
      errors.push(`[${lock.cell}] 자물쇠의 at(${lock.at})이 너무 커서 열 수 없어요.`);
    }
  });
  STAGE.clues.forEach((clue, i) => {
    (clue.cells || []).forEach((cell) => {
      if (!inGrid(cell)) errors.push(`${i}번 단서의 cells [${cell}]가 격자 밖이에요.`);
    });
  });
  if (STAGE.avatars && STAGE.avatars.length !== COLS) {
    errors.push(`avatars의 그림 개수(${STAGE.avatars.length})가 people 수(${COLS})와 달라요.`);
  }
  if (STAGE.reveal && STAGE.reveal.length !== COLS) {
    errors.push(`reveal의 이름 개수(${STAGE.reveal.length})가 people 수(${COLS})와 달라요.`);
  }
  if (STAGE.submitUrl) {
    const grades = STAGE.classesPerGrade;
    if (!Array.isArray(grades) || !grades.length || grades.some((n) => !Number.isInteger(n) || n < 1)) {
      errors.push("classesPerGrade(학년별 반 수)가 없거나 잘못됐어요. 응모 칸의 반 보기를 만들려면 [2, 3, 5, ...]처럼 1 이상의 수로 적어 주세요.");
    }
  }
  const allOptions = STAGE.categories.flatMap((cat) => cat.options);
  Object.keys(STAGE.images || {}).forEach((value) => {
    if (!allOptions.includes(value)) errors.push(`images의 "${value}"가 어떤 options에도 없어요.`);
  });
  return errors;
}

// ----- 상태 -----
function shuffled(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// shuffle: '다시 도전'으로 새로 시작하면 보기 순서를 섞음 (처음 열 때는 stage.js 순서)
function reset(shuffle) {
  const filled = STAGE.answer.map((row) => row.map(() => false));
  STAGE.givens.forEach(([r, c]) => (filled[r][c] = true));
  const optionOrder = STAGE.categories.map((cat) => (shuffle ? shuffled(cat.options) : cat.options.slice()));
  // phase: "playing" | "lost" | "won", selected: 고르는 중인 칸 [행, 열], busy: 흔들리는 중
  // opening: 지금 열리는 모션 중인 자물쇠 칸 ("행,열")
  // justChecked: 방금 충족되어 제자리에서 초록으로 빛나는 단서 (잠시 뒤 맨 밑으로)
  // incoming: 새로 공개되어 카드가 날아오는 중인 단서 (제자리는 비워 둠)
  state = {
    hearts: HEARTS, filled, checkedOrder: [], optionOrder, phase: "playing",
    selected: null, busy: false, opening: new Set(), justChecked: new Set(), incoming: new Set(),
  };
  closePicker();
  hideWin();
  updateChecked(false);
  render();
}

function correctCount() {
  return state.filled.flat().filter(Boolean).length;
}

// 공개된 단서 중 cells가 모두 맞힌 칸이 된 단서를 체크 목록 끝에 추가.
// highlight면 그 단서가 제자리에서 초록으로 잠시 빛난 뒤 맨 밑으로 내려감
function updateChecked(highlight) {
  const count = correctCount();
  const current = state;
  STAGE.clues.forEach((clue, i) => {
    const cells = clue.cells || [];
    if (
      count >= clue.at &&
      cells.length > 0 &&
      cells.every(([r, c]) => state.filled[r][c]) &&
      !state.checkedOrder.includes(i)
    ) {
      state.checkedOrder.push(i);
      if (!highlight) return;
      state.justChecked.add(i);
      // 새 단서 카드가 날아오는 중이면 착지할 때까지 기다렸다가 내려감 (착지 자리가 밀리지 않게)
      const settle = () => {
        if (state !== current) return; // 그 사이 다시 도전
        if (state.incoming.size) return setTimeout(settle, 150);
        state.justChecked.delete(i);
        renderClues();
      };
      setTimeout(settle, 1300);
    }
  });
}

function lockAt(r, c) {
  const lock = STAGE.locks.find((l) => l.cell[0] === r && l.cell[1] === c);
  return lock ? lock.at : null;
}

function isLocked(r, c) {
  const at = lockAt(r, c);
  return at !== null && correctCount() < at;
}

// 체크 안 한 공개 단서 → '?' 카드 → 체크한 단서(체크한 순서).
// 방금 충족된 단서(justChecked)는 초록으로 빛나는 동안 제자리에 머묾
function clueOrder() {
  const count = correctCount();
  const indexes = STAGE.clues.map((_, i) => i);
  const inPlace = indexes.filter((i) => !state.checkedOrder.includes(i) || state.justChecked.has(i));
  const open = inPlace.filter((i) => count >= STAGE.clues[i].at);
  const hidden = inPlace.filter((i) => count < STAGE.clues[i].at);
  return [...open, ...hidden, ...state.checkedOrder.filter((i) => !state.justChecked.has(i))];
}

// ----- 그리기 -----
function render() {
  document.getElementById("title").textContent = STAGE.title;
  renderHearts();
  renderGrid();
  renderClues();
  renderOverlay();
}

function renderOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.hidden = state.phase !== "lost"; // 완료는 축하 화면이 따로 뜸
  if (state.phase === "lost") {
    // 빈 회색 하트: 채워 달라는 듯 위아래로 둥실 (CSS)
    document.getElementById("fail-hearts").innerHTML = HEART_SVG.repeat(HEARTS);
  }
}

function renderHearts() {
  const box = document.getElementById("hearts");
  box.innerHTML = "";
  for (let i = 0; i < HEARTS; i++) {
    box.insertAdjacentHTML("beforeend", HEART_SVG);
    if (i >= state.hearts) box.lastElementChild.classList.add("lost");
  }
}

function renderGrid() {
  const table = document.getElementById("grid");
  table.innerHTML = "";

  const count = correctCount();
  const thead = table.createTHead().insertRow();
  thead.appendChild(document.createElement("th")).className = "corner";
  STAGE.people.forEach((name, c) => {
    const th = thead.appendChild(document.createElement("th"));
    th.className = "person";
    // 맞힌 칸의 그림이 캐릭터 둘레에 스티커처럼 붙음 (행마다 자리 고정)
    const stickers = STAGE.categories
      .map((_, r) => {
        const src = state.filled[r][c] && imageOf(STAGE.answer[r][c]);
        return src ? `<img class="sticker pos${r % 4}" src="${src}" alt="">` : "";
      })
      .join("");
    th.innerHTML = `<div class="avatar-wrap">${avatarSVG(c)}${stickers}</div>`;
    th.appendChild(document.createElement("span")).textContent = name;
  });

  const tbody = table.createTBody();
  STAGE.categories.forEach((category, r) => {
    const tr = tbody.insertRow();
    if (state.filled[r].every(Boolean)) tr.className = "done";
    const th = tr.appendChild(document.createElement("th"));
    th.className = "row-head";
    th.textContent = category.name;

    for (let c = 0; c < COLS; c++) {
      const td = tr.insertCell();
      td.className = "cell";
      td.dataset.r = r;
      td.dataset.c = c;
      if (state.selected && state.selected[0] === r && state.selected[1] === c) {
        td.classList.add("selected");
      }
      // 칸 안쪽 상자를 정사각형으로 만들어 칸 모양을 맞춤
      const inner = td.appendChild(document.createElement("div"));
      inner.className = "cell-inner";
      if (state.filled[r][c]) {
        td.classList.add("filled");
        inner.innerHTML = valueHTML(STAGE.answer[r][c], STAGE.categories[r].label); // label: 칸에도 이름
      } else if (isLocked(r, c)) {
        // 자물쇠 숫자 = 앞으로 더 맞혀야 하는 칸 수
        td.classList.add("locked");
        const lock = inner.appendChild(document.createElement("span"));
        lock.className = "lock";
        lock.textContent = lockAt(r, c) - count;
      } else if (state.opening.has(`${r},${c}`)) {
        // 방금 열린 자물쇠: 고리가 들리고 흔들리다 사라짐
        td.classList.add("opening");
        inner.appendChild(document.createElement("span")).className = "lock unlocking";
      }
    }
  });
  fitLabels(table);
}

function renderClues() {
  const box = document.getElementById("clues");
  // 다시 그리기 전 카드 위치·상태를 기억해 두었다가, 순서가 바뀐 카드는 옛 자리에서 새 자리로 미끄러지게 함
  const before = {};
  box.querySelectorAll(".clue").forEach((card) => {
    before[card.dataset.i] = { top: card.getBoundingClientRect().top, satisfied: card.classList.contains("satisfied") };
  });
  box.innerHTML = "";
  const count = correctCount();
  // 단서 바: 쓴 단서 비율만큼 초록으로 참
  const used = state.checkedOrder.length;
  document.getElementById("clue-count-text").textContent = `단서 ${used}/${STAGE.clues.length}`;
  document.getElementById("clue-fill").style.width = (used / STAGE.clues.length) * 100 + "%";

  clueOrder().forEach((i) => {
    const clue = STAGE.clues[i];
    const card = box.appendChild(document.createElement("div"));
    card.className = "clue";
    card.dataset.i = i;
    if (state.incoming.has(i)) card.classList.add("incoming");
    if (count >= clue.at) {
      if (state.justChecked.has(i)) card.classList.add("satisfied");
      else if (state.checkedOrder.includes(i)) card.classList.add("checked");
      card.innerHTML = `<span class="tab"></span><span>${clueHTML(clue.text)}</span>`;
    } else {
      // 숨은 단서: 앞으로 더 맞혀야 하는 칸 수
      const left = clue.at - count;
      card.classList.add("hidden");
      card.innerHTML = `<span class="badge">${left}</span><span class="q">?</span>`;
      card.append(`${left}칸 더 맞히면 공개`);
    }
  });

  box.querySelectorAll(".clue").forEach((card) => {
    const old = before[card.dataset.i];
    if (!old) return;
    const dy = old.top - card.getBoundingClientRect().top;
    if (Math.abs(dy) < 1) return;
    // 다 쓴 단서(초록 → 체크): 다른 카드 위로 지나가며 흐려지면서 맨 아래로
    const finished = old.satisfied && card.classList.contains("checked");
    if (finished) card.style.zIndex = "1";
    card.animate(
      finished
        ? [{ transform: `translateY(${dy}px)`, opacity: 1 }, { transform: "none", opacity: 0.45 }]
        : [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
      { duration: finished ? 600 : 400, easing: "ease-in-out" }
    ).onfinish = () => (card.style.zIndex = "");
  });
}

// ----- 칸 입력·판정 -----
function onCellTap(event) {
  const td = event.target.closest(".cell");
  if (!td || state.phase !== "playing" || state.busy) return;
  const r = Number(td.dataset.r);
  const c = Number(td.dataset.c);
  if (isLocked(r, c) || state.opening.has(`${r},${c}`)) return;
  playSound("tap");
  if (state.filled[r][c]) showName(r, c);
  else openPicker(r, c);
}

// 맞힌 칸을 다시 탭: 그림 이름을 작게 보여 줌
function showName(r, c) {
  const pop = document.getElementById("picker-pop");
  pop.innerHTML = `<span class="name-tip">${STAGE.answer[r][c]}</span>`;
  document.getElementById("picker").hidden = false;
  placePop(r, c);
}

// 보기 창을 칸 바로 밑에 띄우고 꼬리로 칸을 가리킴. 밑에 자리가 없으면 칸 위에. 화면 밖으로 안 나감
function placePop(r, c) {
  const pop = document.getElementById("picker-pop");
  const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).getBoundingClientRect();
  const margin = 8;
  const tail = 12;
  const centerX = cell.left + cell.width / 2;
  const left = Math.max(margin, Math.min(centerX - pop.offsetWidth / 2, window.innerWidth - pop.offsetWidth - margin));
  pop.style.left = left + "px";
  pop.style.setProperty("--arrow-x", centerX - left + "px");

  const below = cell.bottom + tail;
  const fitsBelow = below + pop.offsetHeight <= window.innerHeight - margin;
  pop.style.top = (fitsBelow ? below : Math.max(margin, cell.top - pop.offsetHeight - tail)) + "px";
  pop.classList.toggle("below", fitsBelow);
  pop.classList.toggle("above", !fitsBelow);
}

// 보기 타일 = 정답 칸 크기. 한 줄에 안 들어가면 조금 줄이고, 너무 작아지면 두 줄로
function tileSize(r, c, count) {
  const cellSize = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).getBoundingClientRect().width;
  const room = window.innerWidth - 16 - 15 - 4 * (count - 1); // 화면 여백·창 테두리·타일 간격
  return Math.floor(Math.min(cellSize, Math.max(room / count, cellSize * 0.75)));
}

// 같은 행에서 이미 정답으로 다 쓰인 값은 보기에서 뺌 (함정 보기는 항상 남음)
function remainingOptions(r) {
  const used = (value) =>
    STAGE.answer[r].filter((v, c) => v === value && state.filled[r][c]).length;
  const total = (value) => STAGE.answer[r].filter((v) => v === value).length;
  return state.optionOrder[r].filter((value) => !(total(value) > 0 && used(value) >= total(value)));
}

function openPicker(r, c) {
  state.selected = [r, c];
  renderGrid();

  const pop = document.getElementById("picker-pop");
  pop.innerHTML = "";
  const options = remainingOptions(r);
  pop.style.setProperty("--tile", tileSize(r, c, options.length) + "px");
  options.forEach((value) => {
    const button = pop.appendChild(document.createElement("button"));
    button.type = "button";
    button.className = "option";
    button.innerHTML = valueHTML(value, true);
    button.addEventListener("click", () => choose(r, c, value, button));
  });
  document.getElementById("picker").hidden = false;
  fitLabels(pop);
  placePop(r, c);
}

function closePicker() {
  document.getElementById("picker").hidden = true;
  if (state && state.selected) {
    state.selected = null;
    renderGrid();
  }
}

function choose(r, c, value, button) {
  // 고른 보기의 그림 위치 (그림이 여기서 정답 칸으로 날아감)
  const from = button && button.querySelector(".value-img") ? button.querySelector(".value-img").getBoundingClientRect() : null;
  closePicker();
  if (value === STAGE.answer[r][c]) {
    playSound("correct");
    const before = correctCount();
    state.filled[r][c] = true;
    const after = before + 1;
    updateChecked(true);
    // 이번에 기준을 넘은 자물쇠: 약 0.8초 열리는 모션, 그동안 그 칸 탭 무시
    const current = state;
    const opening = STAGE.locks.filter((lock) => before < lock.at && lock.at <= after);
    if (opening.length) playSound("unlock", 0.4); // 정답 "띠링" 뒤에 작게
    opening.forEach((lock) => {
      const key = lock.cell.join(",");
      state.opening.add(key);
      setTimeout(() => {
        if (state !== current) return; // 그 사이 다시 도전
        state.opening.delete(key);
        renderGrid();
      }, 850);
    });
    render();
    // 정답 모션: 보기 자리에서 반짝 → 그림이 칸으로 날아감 → 칸에서 반짝·통통 + 자물쇠 흔들림
    const land = () => {
      const td = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      td.classList.remove("landing");
      td.classList.add("just-correct");
      document.querySelectorAll(".lock:not(.unlocking)").forEach((lock) => lock.classList.add("tick"));
      setTimeout(() => bingo(r, c), 450); // 통통 모션이 끝난 뒤
    };
    if (from) {
      document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).classList.add("landing");
      flyPicture(value, from, r, c, land);
    } else {
      land();
    }
    // 이번에 새로 공개된 단서
    const fresh = STAGE.clues.map((clue, i) => i).filter((i) => before < STAGE.clues[i].at && STAGE.clues[i].at <= after);
    if (fresh.length) announceNewClues(fresh, r, c);
    // 모든 칸을 맞힘: 정답 모션이 끝난 뒤 축하 화면
    if (state.filled.flat().every(Boolean)) {
      state.phase = "won";
      setTimeout(showWin, 2100); // 날아가기·통통·빙고 파도가 끝난 뒤
    }
    return;
  }

  // 오답: 하트 -1, 칸은 빈 채로 테두리만 굵어지며 좌우로 흔들림
  playSound("wrong");
  state.hearts -= 1;
  state.busy = true;
  renderHearts();
  document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).classList.add("wrong");
  setTimeout(() => {
    state.busy = false;
    if (state.hearts === 0) state.phase = "lost";
    render();
  }, 600);
}

// 빙고: 방금 맞힌 칸으로 가로줄·세로줄이 완성되면 그 줄 그림이 차례로 통 튀며 파도처럼 지나감
function bingo(r, c) {
  const pictureAt = (row, col) =>
    document.querySelector(`.cell[data-r="${row}"][data-c="${col}"] .cell-inner > *`);
  const wave = (items) =>
    items.forEach((el, i) => {
      if (!el) return;
      el.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-10px)" }, { transform: "translateY(0)" }],
        { duration: 420, delay: i * 90, easing: "ease-in-out" }
      );
    });
  const rowDone = state.filled[r].every(Boolean);
  const colDone = state.filled.every((row) => row[c]);
  if (state.filled.flat().every(Boolean)) playSound("clear");
  else if (rowDone || colDone) playSound("line");
  if (rowDone) {
    wave(STAGE.people.map((_, col) => pictureAt(r, col)));
  }
  if (colDone) {
    const face = document.querySelectorAll(".grid .person .avatar-wrap")[c];
    wave([face, ...STAGE.categories.map((_, row) => pictureAt(row, c))]);
  }
}

// 보기 자리에서 반짝 터진 뒤, 그림이 포물선을 그리며 정답 칸 가운데로 날아감
function flyPicture(value, from, r, c, onLand) {
  const burst = document.body.appendChild(document.createElement("div"));
  burst.className = "burst";
  burst.style.left = from.left + from.width / 2 + "px";
  burst.style.top = from.top + from.height / 2 + "px";
  setTimeout(() => burst.remove(), 1000);

  const to = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).getBoundingClientRect();
  const img = document.body.appendChild(document.createElement("img"));
  img.className = "fly-picture";
  img.src = imageOf(value);
  img.alt = "";
  const x0 = from.left + from.width / 2;
  const y0 = from.top + from.height / 2;
  const x1 = to.left + to.width / 2;
  const y1 = to.top + to.height / 2;
  const lift = Math.min(y0, y1) - 40; // 포물선 꼭대기
  const flight = img.animate(
    [
      { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(1)` },
      { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(1.25)`, offset: 0.25 },
      { transform: `translate(${(x0 + x1) / 2}px, ${lift}px) translate(-50%, -50%) scale(1.15)`, offset: 0.62 },
      { transform: `translate(${x1}px, ${y1}px) translate(-50%, -50%) scale(1)` },
    ],
    { duration: 850, easing: "ease-in-out" }
  );
  flight.onfinish = () => {
    img.remove();
    document.querySelectorAll(".trail").forEach((dot) => dot.remove()); // 도착하면 잔상도 바로 정리
    onLand();
  };

  // 잔상: 날아가는 동안 지나간 자리에 초록빛 점을 남겨 꼬리처럼 사라지게 함.
  // 도착 직전(마지막 25%)에는 새 점을 만들지 않아 칸에 닿을 때 꼬리가 거의 사라져 있음
  const trail = () => {
    if (flight.playState !== "running" || flight.currentTime > 850 * 0.75) return;
    const b = img.getBoundingClientRect();
    const dot = document.body.appendChild(document.createElement("div"));
    dot.className = "trail";
    dot.style.left = b.left + b.width / 2 + "px";
    dot.style.top = b.top + b.height / 2 + "px";
    setTimeout(() => dot.remove(), 250);
    requestAnimationFrame(trail);
  };
  requestAnimationFrame(trail);
}

// ----- 새 단서 팝업: "+N 새 단서!" + 맞힌 칸에서 단서판 제자리로 날아가는 단서 카드 -----
function announceNewClues(indexes, r, c) {
  const grid = document.getElementById("grid").getBoundingClientRect();
  const badge = document.body.appendChild(document.createElement("div"));
  badge.className = "new-clue";
  badge.textContent = `+${indexes.length} 새 단서!`;
  badge.style.top = grid.top + 4 + "px";
  badge.style.right = Math.max(8, window.innerWidth - grid.right + 4) + "px";
  setTimeout(() => badge.remove(), 1900);

  // 새 단서마다: 단서 문장이 적힌 종이 카드가 맞힌 칸 근처에서 기울어진 채 튀어나와
  // 단서판의 제자리로 날아가 내려앉음 (그동안 제자리 카드는 비워 둠)
  const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).getBoundingClientRect();
  const current = state;
  const slot = (i) => document.querySelector(`.clue[data-i="${i}"]`);
  indexes.forEach((i, n) => {
    if (!slot(i)) return;
    state.incoming.add(i);
    slot(i).classList.add("incoming");
    setTimeout(() => {
      if (state !== current) return; // 그 사이 다시 도전
      const target = slot(i);
      target.scrollIntoView({ block: "nearest" });
      const to = target.getBoundingClientRect();
      // 실제 단서 카드와 같은 모양·폭으로 만들어, 크기는 가로세로를 똑같이만 바꿈 (글자가 늘어나지 않게)
      const card = document.body.appendChild(document.createElement("div"));
      card.className = "clue fly-clue";
      card.style.width = to.width + "px";
      card.innerHTML = `<span class="tab"></span><span>${clueHTML(STAGE.clues[i].text)}</span>`;
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const small = 0.55; // 칸 근처에 튀어나올 때 크기
      const x0 = Math.min(Math.max(cell.left + cell.width / 2, (w * small) / 2 + 8), window.innerWidth - (w * small) / 2 - 8);
      const y0 = cell.top + cell.height / 2;
      const at = (x, y) => `translate(${x - w / 2}px, ${y - h / 2}px)`;
      card.animate(
        [
          { transform: `${at(x0, y0)} rotate(-25deg) scale(0.1)`, opacity: 0 },
          { transform: `${at(x0, y0 + 20)} rotate(-12deg) scale(${small})`, opacity: 1, offset: 0.3 },
          { transform: `${at(x0, y0 + 30)} rotate(-14deg) scale(${small})`, opacity: 1, offset: 0.55 },
          { transform: `${at(to.left + to.width / 2, to.top + to.height / 2)} rotate(0deg) scale(1)`, opacity: 1 },
        ],
        { duration: 1300, easing: "ease-in-out" }
      ).onfinish = () => {
        card.remove();
        state.incoming.delete(i);
        const landed = slot(i); // 날아오는 사이 단서판이 다시 그려졌을 수 있음
        if (landed) {
          landed.classList.remove("incoming");
          landed.classList.add("fresh");
        }
      };
    }, n * 400);
  });
}

// ----- 완료 축하 화면: 맨 위 인물 칸이 가운데 판으로 날아와 모임 -----
const CONFETTI_COLORS = ["#ff7a7a", "#ffd24d", "#7cc8ff", "#8fdc8a", "#c9a0ff", "#ff9ec4"];

function showWin() {
  if (state.phase !== "won") return; // 그 사이 다시 도전을 누름
  const win = document.getElementById("win");
  const panel = document.getElementById("win-cards");
  const heads = [...document.querySelectorAll(".grid .person")];
  panel.innerHTML = "";
  win.hidden = false;
  playSound("fireworks");

  const confetti = document.getElementById("confetti");
  confetti.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const piece = confetti.appendChild(document.createElement("i"));
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
    piece.style.animationDelay = Math.random() * 2 + "s";
  }

  // 카드를 판에 놓은 뒤, 격자 위치에서 출발해 제자리로 날아오게 함
  const cards = heads.map((head) => {
    const card = panel.appendChild(document.createElement("div"));
    card.className = "win-card";
    card.innerHTML = head.innerHTML;
    return card;
  });
  // stage.js의 reveal: 카드 밑에 진짜 이름(예: 장소 1 → 운동장)을 붙여 두었다가 제목과 함께 보여 줌
  const reveals = (STAGE.reveal || []).map((name, i) => {
    const label = cards[i].appendChild(document.createElement("em"));
    label.className = "win-reveal";
    label.textContent = name;
    return label;
  });
  const stagger = 180;
  cards.forEach((card, i) => {
    const from = heads[i].getBoundingClientRect();
    const to = card.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const tilt = i % 2 ? 12 : -12;
    card.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: `translate(${dx / 2}px, ${dy / 2 - 70}px) rotate(${tilt}deg) scale(1.1)`, offset: 0.5 },
        { transform: "none" },
      ],
      { duration: 750, delay: i * stagger, easing: "ease-in-out", fill: "backwards" }
    ).onfinish = () => {
      card.style.animationDelay = i * 0.15 + "s";
      card.classList.add("hop");
    };
  });

  const landed = cards.length * stagger + 750;
  setTimeout(() => document.getElementById("win-title").classList.add("show"), landed);
  reveals.forEach((label, i) => setTimeout(() => label.classList.add("show"), landed + 300 + i * 250));
  setTimeout(() => {
    document.getElementById("win-retry").classList.add("show");
    document.getElementById("entry").classList.add("show");
  }, landed + 500);
}

function hideWin() {
  document.getElementById("win").hidden = true;
  document.getElementById("win-cards").innerHTML = "";
  document.getElementById("confetti").innerHTML = "";
  document.getElementById("win-title").classList.remove("show");
  document.getElementById("win-retry").classList.remove("show");
  resetEntry();
}

// ----- 응모: 다 맞힌 뒤 학년·반·번호·이름·이유를 구글 시트로 보냄 (한 판에 한 번) -----
function resetEntry() {
  const form = document.getElementById("entry");
  form.hidden = !STAGE.submitUrl;
  form.classList.remove("show", "done");
  form.reset();
  document.getElementById("entry-count").textContent = "0/100";
  document.getElementById("entry-message").textContent = "";
  document.getElementById("entry-notice").textContent = STAGE.submitNotice || "";
  const submit = document.getElementById("entry-submit");
  submit.disabled = false;
  submit.textContent = "제출하기";
  form.querySelectorAll("input, select, textarea").forEach((el) => (el.disabled = false));
  fillClassOptions();   // 학년을 고르기 전에는 반 칸이 잠겨 있음
}

// 반 보기 목록: 고른 학년에 있는 반만 (stage.js classesPerGrade). 학년을 안 골랐으면 잠금
function fillClassOptions() {
  const grade = Number(document.getElementById("entry-grade").value);
  const classes = STAGE.classesPerGrade || [];
  const count = Number.isInteger(classes[grade - 1]) ? classes[grade - 1] : 0;
  const select = document.getElementById("entry-class");
  select.innerHTML = '<option value="">-</option>';
  for (let i = 1; i <= count; i++) {
    const option = select.appendChild(document.createElement("option"));
    option.value = String(i);
    option.textContent = String(i);
  }
  select.value = "";
  select.disabled = !count;
}

async function submitEntry(event) {
  event.preventDefault();
  const value = (id) => document.getElementById(id).value.trim();
  const entry = {
    grade: value("entry-grade"),
    klass: value("entry-class"),
    number: value("entry-number"),
    name: value("entry-name"),
    reason: value("entry-reason"),
  };
  const message = document.getElementById("entry-message");
  if (Object.values(entry).some((v) => !v)) {
    message.textContent = "다섯 칸을 모두 적어 주세요.";
    return;
  }
  if (!/^\d+$/.test(entry.number)) {   // 학년·반은 고르는 칸이라 검사하지 않음
    message.textContent = "번호는 숫자로 적어 주세요.";
    return;
  }

  const form = document.getElementById("entry");
  const submit = document.getElementById("entry-submit");
  submit.disabled = true;
  submit.textContent = "보내는 중...";
  message.textContent = "";
  try {
    // 내용은 주소가 아니라 본문으로 보냄. text/plain이라 구글 웹 앱에 바로 전달됨
    const response = await fetch(STAGE.submitUrl, { method: "POST", body: JSON.stringify(entry) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error);
    form.classList.add("done");
    form.querySelectorAll("input, select, textarea").forEach((el) => (el.disabled = true));
    submit.textContent = "제출했어요!";
  } catch (error) {
    // 실패하면 적은 내용은 그대로 두고 다시 보낼 수 있게
    submit.disabled = false;
    submit.textContent = "다시 보내기";
    message.textContent = "보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.";
  }
}

document.getElementById("entry").addEventListener("submit", submitEntry);
document.getElementById("entry-grade").addEventListener("change", fillClassOptions);
document.getElementById("entry-reason").addEventListener("input", (event) => {
  document.getElementById("entry-count").textContent = `${event.target.value.length}/100`;
});

// ----- 시작 화면: 제목 + 둥실거리는 게임 속 그림·친구 캐릭터 + 시작하기 -----
// 자리: [왼쪽 %, 위쪽 %, 크기 px, 기울기 deg] — 로고(가운데)와 버튼(아래)을 피해 둘레에 배치
const START_SPOTS = [
  [6, 9, 66, -12], [72, 7, 62, 10], [40, 4, 50, 4],
  [4, 55, 60, 8], [74, 54, 64, -10], [12, 70, 52, -6], [70, 70, 56, 12], [42, 62, 48, -8],
];

function showStart() {
  document.getElementById("start-title").textContent = STAGE.title;
  const pictures = [...new Set(Object.values(STAGE.images || {}))].map((src) => `<img src="${src}" alt="">`);
  const faces = STAGE.people.slice(0, 3).map((_, c) => avatarSVG(c));
  // 그림과 캐릭터를 번갈아 섞어서 자리에 놓음
  const items = [];
  for (let i = 0; items.length < START_SPOTS.length && (i < pictures.length || i < faces.length); i++) {
    if (pictures[i]) items.push(pictures[i]);
    if (faces[i]) items.push(faces[i]);
  }
  const box = document.getElementById("start-stickers");
  box.innerHTML = "";
  items.slice(0, START_SPOTS.length).forEach((html, i) => {
    const [left, top, size, tilt] = START_SPOTS[i];
    const sticker = box.appendChild(document.createElement("div"));
    sticker.className = "start-sticker";
    sticker.style.cssText = `left:${left}%;top:${top}%;width:${size}px;height:${size}px;rotate:${tilt}deg;animation-delay:${i * 0.35}s`;
    sticker.innerHTML = html;
  });
  document.getElementById("start").hidden = false;
}

document.getElementById("start-button").addEventListener("click", () => {
  playSound("tap");
  const start = document.getElementById("start");
  start.classList.add("leaving");
  setTimeout(() => (start.hidden = true), 400);
});

document.getElementById("grid").addEventListener("click", onCellTap);
document.getElementById("win-retry").addEventListener("click", () => {
  playSound("tap");
  reset(true);
});
document.getElementById("picker").addEventListener("click", (event) => {
  if (event.target.id === "picker") closePicker(); // 바깥 탭
});
document.getElementById("retry").addEventListener("click", () => {
  playSound("tap");
  reset(true);
});

// ----- 시작 -----
const errors = validateStage();
if (errors.length) {
  const box = document.getElementById("error");
  box.hidden = false;
  box.innerHTML = "<strong>stage.js를 확인해 주세요.</strong>";
  errors.forEach((msg) => box.appendChild(document.createElement("p")).append(msg));
} else {
  reset();
  showStart();
}
