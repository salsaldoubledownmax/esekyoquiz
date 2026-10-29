// 퍼즐 검사: 답이 하나뿐인지, 단서 공개 순서대로 찍지 않고 끝까지 풀리는지
// 게임 폴더에서: node tools/solve.js stage.js tools/rules.js
// rules.js = stage.js 단서와 같은 순서로, 단서 문장의 뜻을 코드로 적은 목록 (단서를 고치면 같이 고침)
const fs = require("fs");
const path = require("path");
const STAGE = new Function(fs.readFileSync(process.argv[2] || "stage.js", "utf8") + "; return STAGE;")();
const RULES = require(path.resolve(process.argv[3] || "tools/rules.js"));
const P = STAGE.people.length;
const R = STAGE.categories.length;
if (RULES.length !== STAGE.clues.length) {
  console.log(`rules.js 규칙 수(${RULES.length})와 단서 수(${STAGE.clues.length})가 달라요.`);
  process.exit(1);
}

// s[행][열] = 값, col(s, 행, 값) = 그 값이 있는 열
const col = (s, r, v) => s[r].indexOf(v);

function perms(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}
// 행마다 가능한 배치(선택지 중 P개를 고른 순열)
function choose(arr, k) {
  if (k === 0) return [[]];
  return arr.flatMap((x, i) => choose(arr.slice(i + 1), k - 1).map((c) => [x, ...c]));
}
const rowOptions = STAGE.categories.map((c) => choose(c.options, P).flatMap(perms));
const givenOK = (s) => STAGE.givens.every(([r, c]) => s[r][c] === STAGE.answer[r][c]);

// 시작 칸 + 고른 단서를 모두 만족하는 답 목록 — 4×4면 24^4 = 33만 개라 충분히 빠름
function allSolutions(ruleIdx) {
  const out = [];
  const s = [];
  (function rec(r) {
    if (r === R) {
      if (givenOK(s) && ruleIdx.every((i) => RULES[i](s, col))) out.push(s.map((row) => row.slice()));
      return;
    }
    for (const row of rowOptions[r]) { s[r] = row; rec(r + 1); }
  })(0);
  return out;
}

const sameAsAnswer = (s) => s.every((row, r) => row.every((v, c) => v === STAGE.answer[r][c]));
const all = allSolutions(STAGE.clues.map((_, i) => i));
console.log("모든 단서로 가능한 답 수:", all.length, all.length === 1 && sameAsAnswer(all[0]) ? "(정답과 같음)" : "(문제 있음!)");

// 단계별 풀이 흉내: 공개된 단서 + 채운 칸으로 답이 정해지는 칸을 하나씩 채움 (잠긴 칸은 못 채움)
const filled = STAGE.answer.map((row) => row.map(() => false));
STAGE.givens.forEach(([r, c]) => (filled[r][c] = true));
const count = () => filled.flat().filter(Boolean).length;
const locked = (r, c) => STAGE.locks.some((l) => l.cell[0] === r && l.cell[1] === c && count() < l.at);
const cache = new Map();
let step = 0;
while (count() < R * P) {
  const shown = STAGE.clues.map((cl, i) => (count() >= cl.at ? i : -1)).filter((i) => i >= 0);
  const key = shown.join(",");
  if (!cache.has(key)) cache.set(key, allSolutions(shown));
  const sols = cache.get(key).filter((s) => filled.every((row, r) => row.every((f, c) => !f || s[r][c] === STAGE.answer[r][c])));
  const forced = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < P; c++) {
    if (filled[r][c] || locked(r, c)) continue;
    if (sols.every((s) => s[r][c] === sols[0][r][c])) forced.push([r, c]);
  }
  if (!forced.length) {
    console.log(`막힘! 맞힌 칸 ${count()}개, 공개 단서 ${shown.map((i) => i + 1).join(",")}`);
    process.exit(1);
  }
  step++;
  console.log(`${step}. 맞힌 칸 ${count()}개 | 공개 단서 ${shown.map((i) => i + 1).join(",")} | 알 수 있는 칸: ` +
    forced.map(([r, c]) => `${STAGE.people[c]}-${STAGE.categories[r].name}=${STAGE.answer[r][c]}`).join(", "));
  const [r, c] = forced[0]; // 한 번에 하나씩 채움(가장 적게 아는 상황을 흉내)
  filled[r][c] = true;
}
console.log("끝까지 풀림");
