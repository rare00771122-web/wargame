const canvas = document.getElementById("gameCanvas");

if (!canvas) {
  alert("gameCanvas が見つかりません");
  throw new Error("Canvas not found");
}

const ctx = canvas.getContext("2d");

// =====================
// ゲーム状態
// =====================
let gameState = "title";
let gameOver = false;
let gameResult = "";

let selectedUnits = [];

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragEndX = 0;
let dragEndY = 0;

let currentFormation = "line";

// =====================
// UI
// =====================
const startButton = {
  x: 400,
  y: 320,
  width: 200,
  height: 70
};

// =====================
// マップ
// =====================
const blueCapital = { x: 35, y: 48 };
const redCapital = { x: 965, y: 565 };

const towns = [
  { x: 430, y: 240, owner: null },
  { x: 560, y: 375, owner: null },
  { x: 845, y: 165, owner: null },
  { x: 935, y: 335, owner: null },
  { x: 1008, y: 140, owner: null },
  { x: 135, y: 560, owner: null }
];

// 山
const mountains = [
  { x: 600, y: 0, w: 120, h: 85 },
  { x: 140, y: 298, w: 315, h: 135 },
  { x: 58, y: 488, w: 45, h: 100 }
];

// =====================
// 川（上部蛇行川）
// =====================
const riverTop = [
  { x: 380, y: 0 },
  { x: 410, y: 40 },
  { x: 430, y: 95 },
  { x: 450, y: 155 },
  { x: 485, y: 200 },
  { x: 560, y: 210 },
  { x: 640, y: 190 },
  { x: 720, y: 145 },
  { x: 810, y: 110 },
  { x: 890, y: 110 },
  { x: 900, y: 175 },
  { x: 860, y: 245 },
  { x: 905, y: 285 },
  { x: 985, y: 285 },
  { x: 1030, y: 235 },
  { x: 1080, y: 185 },
  { x: 1150, y: 160 }
];

// 湖
const lake = {
  x: 385,
  y: 355,
  w: 250,
  h: 160
};

// 橋
const bridges = [
  { x: 430, y: 68, width: 48, height: 24 },
  { x: 870, y: 246, width: 48, height: 24 }
];

// =====================
// 軍
// =====================
const blueUnits = [];
const redUnits = [];

const blueSquads = [];
const redSquads = [];

// =====================
// ユニット生成
// =====================
function createUnit(x, y, type, color) {

  let tries = 0;
  while (isBlockedTerrain(x, y) && tries < 50) {
    x -= 8;
    y += 8;
    tries++;
  }

  const isSoldier = type === "soldier";
  const isArtillery = type === "artillery";

  return {
    x,
    y,
    type,
    color,

    hp: isSoldier ? 100 : 200,
    speed: isSoldier ? 0.20 : 0.16,
    range: isSoldier ? 28 : 36,
    damage: isSoldier ? 0.18 : 0.27,

    alive: true,
    targetX: null,
    targetY: null,
    attackTarget: null,

    blocked: false,
    manualStop: false,
    inBattle: false,
    retreating: false,

    morale: 100,
    routing: false,
    berserk: false,
    lastHp: isSoldier ? 100 : 200
  };
}

// =====================
// 初期配置
// =====================
function createUnits() {
  blueUnits.length = 0;
  redUnits.length = 0;

  // =========================
  // 青軍（左側）
  // =========================

  // 砲兵
  blueUnits.push(createUnit(150, 450, "artillery", "blue"));
  blueUnits.push(createUnit(280, 140, "artillery", "blue"));
  blueUnits.push(createUnit(250, 200, "artillery", "blue"));
  blueUnits.push(createUnit(220, 260, "artillery", "blue"));

  // 左下予備隊
  blueUnits.push(createUnit(160, 500, "soldier", "blue"));
  blueUnits.push(createUnit(210, 500, "soldier", "blue"));
  blueUnits.push(createUnit(190, 550, "soldier", "blue"));
  blueUnits.push(createUnit(240, 540, "soldier", "blue"));

  // 中央主力縦隊
  blueUnits.push(createUnit(340, 140, "soldier", "blue"));
  blueUnits.push(createUnit(320, 190, "soldier", "blue"));
  blueUnits.push(createUnit(300, 240, "soldier", "blue"));
  blueUnits.push(createUnit(280, 290, "soldier", "blue"));

  // 川沿い中央
  blueUnits.push(createUnit(410, 130, "soldier", "blue"));
  blueUnits.push(createUnit(390, 170, "soldier", "blue"));
  blueUnits.push(createUnit(370, 210, "soldier", "blue"));
  blueUnits.push(createUnit(350, 250, "soldier", "blue"));
  blueUnits.push(createUnit(330, 290, "soldier", "blue"));

  // 上部隊
  blueUnits.push(createUnit(500, 60, "soldier", "blue"));
  blueUnits.push(createUnit(540, 60, "soldier", "blue"));
  blueUnits.push(createUnit(500, 100, "soldier", "blue"));
  blueUnits.push(createUnit(540, 100, "soldier", "blue"));

  // 予備部隊
  blueUnits.push(createUnit(100, 70, "soldier", "blue"));
  blueUnits.push(createUnit(100, 110, "soldier", "blue"));
  blueUnits.push(createUnit(130, 70, "soldier", "blue"));
  blueUnits.push(createUnit(130, 110, "soldier", "blue"));


  // =========================
  // 赤軍（右側）
  // =========================

  // 砲兵
  redUnits.push(createUnit(850, 300, "artillery", "red"));
  redUnits.push(createUnit(850, 360, "artillery", "red"));
  redUnits.push(createUnit(840, 450, "artillery", "red"));
  redUnits.push(createUnit(820, 540, "artillery", "red"));

  // 上部隊
  redUnits.push(createUnit(820, 30, "soldier", "red"));
  redUnits.push(createUnit(860, 30, "soldier", "red"));
  redUnits.push(createUnit(820, 70, "soldier", "red"));
  redUnits.push(createUnit(860, 70, "soldier", "red"));

  // 中央主力
  redUnits.push(createUnit(720, 280, "soldier", "red"));
  redUnits.push(createUnit(780, 300, "soldier", "red"));
  redUnits.push(createUnit(720, 340, "soldier", "red"));
  redUnits.push(createUnit(780, 360, "soldier", "red"));
  redUnits.push(createUnit(720, 420, "soldier", "red"));
  redUnits.push(createUnit(780, 440, "soldier", "red"));

  // 縦隊右翼
  redUnits.push(createUnit(650, 260, "soldier", "red"));
  redUnits.push(createUnit(650, 320, "soldier", "red"));
  redUnits.push(createUnit(650, 380, "soldier", "red"));
  redUnits.push(createUnit(650, 440, "soldier", "red"));
  redUnits.push(createUnit(650, 520, "soldier", "red"));
  redUnits.push(createUnit(650, 570, "soldier", "red"));

  // 右翼奥
  redUnits.push(createUnit(700, 520, "soldier", "red"));
  redUnits.push(createUnit(740, 550, "soldier", "red"));

  // 予備部隊
  redUnits.push(createUnit(900, 510, "soldier", "red"));
  redUnits.push(createUnit(900, 550, "soldier", "red"));
  redUnits.push(createUnit(930, 510, "soldier", "red"));
  redUnits.push(createUnit(930, 550, "soldier", "red"));
}

// =====================
// 小隊生成
// =====================
function createSquads() {
  blueSquads.length = 0;
  redSquads.length = 0;

  // 味方は初期命令なし
  blueSquads.push(makeSquad("left", "blue", blueUnits.slice(0, 6), null, null));
  blueSquads.push(makeSquad("center", "blue", blueUnits.slice(6, 12), null, null));
  blueSquads.push(makeSquad("right", "blue", blueUnits.slice(12), null, null));

  // 敵は防衛位置あり
  redSquads.push(makeSquad("left", "red", redUnits.slice(0, 6), 650, 180));
  redSquads.push(makeSquad("center", "red", redUnits.slice(6, 12), 650, 300));
  redSquads.push(makeSquad("right", "red", redUnits.slice(12), 650, 420));
}

function makeSquad(name, team, units, tx, ty) {
  return {
    name,
    team,
    units,
    targetX: tx,
    targetY: ty,
    morale: 100,
    formation: "line"
  };
}

// =====================
// 描画
// =====================
function drawMap() {
  // 草原
  ctx.fillStyle = "#27b043";
  ctx.fillRect(0, 0, 1100, 650);

  drawTopRiver();
  drawLake();
  drawMountains();
  drawBridges();
}

// =====================
// 上部の蛇行川
// =====================
function drawTopRiver() {
  ctx.strokeStyle = "#14a0e8";
  ctx.lineWidth = 29;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(riverTop[0].x, riverTop[0].y);

  for (let i = 1; i < riverTop.length; i++) {
    ctx.lineTo(riverTop[i].x, riverTop[i].y);
  }

  ctx.stroke();
}

// =====================
// 湖
// =====================
function drawLake() {
  ctx.fillStyle = "#169ddb";

  ctx.beginPath();
  ctx.moveTo(390, 355);
  ctx.quadraticCurveTo(520, 340, 610, 430);
  ctx.quadraticCurveTo(650, 500, 600, 535);
  ctx.quadraticCurveTo(500, 555, 405, 505);
  ctx.quadraticCurveTo(365, 470, 380, 400);
  ctx.closePath();

  ctx.fill();
}

// =====================
// 橋
// =====================
function drawBridges() {
  ctx.fillStyle = "#b37a48";

  for (let b of bridges) {
    ctx.fillRect(
      b.x - b.width / 2,
      b.y - b.height / 2,
      b.width,
      b.height
    );
  }
}



// 川近接判定
function isNearRiver(x, y) {

  const riverWidth = 16; // 川半幅

  for (let i = 0; i < riverTop.length - 1; i++) {

    const ax = riverTop[i].x;
    const ay = riverTop[i].y;

    const bx = riverTop[i + 1].x;
    const by = riverTop[i + 1].y;

    const dx = bx - ax;
    const dy = by - ay;

    const lenSq = dx * dx + dy * dy;

    let t = ((x - ax) * dx + (y - ay) * dy) / lenSq;

    if (t < 0) t = 0;
    if (t > 1) t = 1;

    const px = ax + dx * t;
    const py = ay + dy * t;

    const distX = x - px;
    const distY = y - py;

    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < riverWidth) {
      return true;
    }
  }

  return false;
}

function drawStar(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < 5; i++) {
    let angle = i * Math.PI * 2 / 5 - Math.PI / 2;

    let px = x + Math.cos(angle) * size;
    let py = y + Math.sin(angle) * size;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);

    angle += Math.PI / 5;

    px = x + Math.cos(angle) * (size / 2);
    py = y + Math.sin(angle) * (size / 2);

    ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = "yellow";
  ctx.stroke();
}

function drawCapitals() {
  drawStar(blueCapital.x, blueCapital.y, 28, "blue");
  drawStar(redCapital.x, redCapital.y, 28, "red");
}

function drawTowns() {

  for (let t of towns) {

    if (t.owner === "blue") ctx.fillStyle = "blue";
    else if (t.owner === "red") ctx.fillStyle = "red";
    else ctx.fillStyle = "yellow";

    ctx.beginPath();
    ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// 町の占領判定
function captureTowns() {

  for (let t of towns) {

    for (let u of blueUnits) {
      if (!u.alive) continue;

      const dx = u.x - t.x;
      const dy = u.y - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 22) {
        t.owner = "blue";
      }
    }

    for (let u of redUnits) {
      if (!u.alive) continue;

      const dx = u.x - t.x;
      const dy = u.y - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 22) {
        t.owner = "red";
      }
    }
  }
}

function drawHpBar(x, y, hp, maxHp) {
  ctx.fillStyle = "black";
  ctx.fillRect(x - 14, y - 18, 28, 4);

  ctx.fillStyle = "lime";
  ctx.fillRect(x - 14, y - 18, 28 * (hp / maxHp), 4);
}

// 白変化・点滅なし。状態変化は本体色のみ。
function drawUnits(units) {

  for (let u of units) {

    if (!u.alive) continue;

    let drawX = u.x;
    let drawY = u.y;

    // 戦闘中のみ軽く揺れる
    if (u.inBattle) {
      drawX += Math.random() * 2 - 1;
      drawY += Math.random() * 2 - 1;
    }

    // 常に元の色
    ctx.fillStyle = u.color;

    // 歩兵
    if (u.type === "soldier") {
      ctx.beginPath();
      ctx.arc(drawX, drawY, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // 砲兵
    if (u.type === "artillery") {
      ctx.beginPath();
      ctx.arc(drawX, drawY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = (u.color === "blue") ? "#6ea8ff" : "#ff8a8a";
      ctx.beginPath();
      ctx.arc(drawX, drawY, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 選択リング
    if (selectedUnits.includes(u)) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(drawX, drawY, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawHpBar(
      drawX,
      drawY,
      u.hp,
      u.type === "soldier" ? 100 : 200
    );
  }
}

function drawTitle() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1000, 600);

  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("WAR GAME", 500, 180);

  ctx.fillStyle = "darkblue";
  ctx.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);

  ctx.fillStyle = "white";
  ctx.font = "36px sans-serif";
  ctx.fillText("START", 500, 365);

  ctx.textAlign = "left";
}

function draw() {
  if (gameState === "title") {
    drawTitle();
    return;
  }

  drawMap();
  drawTowns();
  drawMountains();
  drawCapitals();

  drawUnits(blueUnits);
  drawUnits(redUnits);

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";

  let txt = "横隊";
  if (currentFormation === "column") txt = "縦隊";
  if (currentFormation === "circle") txt = "円陣";

  ctx.fillText("陣形: " + txt + " [1][2][3]", 20, 30);

  ctx.fillText("選択数: " + selectedUnits.length, 20, 55);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 1000, 600);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(gameResult, 500, 260);

    ctx.font = "28px sans-serif";
    ctx.fillText("Press R to Restart", 500, 340);

    ctx.textAlign = "left";
  }

  if (isDragging) {
    const x = Math.min(dragStartX, dragEndX);
    const y = Math.min(dragStartY, dragEndY);
    const w = Math.abs(dragEndX - dragStartX);
    const h = Math.abs(dragEndY - dragStartY);

    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, w, h);
  }
}

// =====================
// ゲーム更新
// =====================
function update() {
  if (gameState !== "play") return;
  if (gameOver) return;

  for (let u of blueUnits) if (u.alive) u.inBattle = false;
  for (let u of redUnits) if (u.alive) u.inBattle = false;

  moveBluePlayer();
  moveRedAI();

  for (let u of blueUnits) if (u.alive) keepInsideMap(u);
  for (let u of redUnits) if (u.alive) keepInsideMap(u);

  separateUnits(blueUnits);
  separateUnits(redUnits);
  separateMixed(blueUnits, redUnits);
  blockEnemyContact();

  attackArmy(blueUnits, redUnits);
  attackArmy(redUnits, blueUnits);

  updateMoraleAll();
  healUnits();
  captureTowns();
  checkGameResult();
}

// =====================
// 移動
// =====================
function moveBluePlayer() {

  for (let u of blueUnits) {

    if (!u.alive) continue;
    if (u.blocked) continue;

    // 敵追跡解除
    if (u.attackTarget && !u.attackTarget.alive) {
      u.attackTarget = null;
    }

    // 敵追跡中
    if (u.attackTarget) {

      const enemy = u.attackTarget;

      const dx = enemy.x - u.x;
      const dy = enemy.y - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > u.range - 2) {
        const nx = u.x + dx / dist * u.speed;
        const ny = u.y + dy / dist * u.speed;

        moveUnitWithSlide(u, dx, dy);
      }

      continue;
    }

    // 通常移動
    if (u.targetX == null || u.targetY == null) continue;

    const dx = u.targetX - u.x;
    const dy = u.targetY - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= 3) {
      u.targetX = null;
      u.targetY = null;
      continue;
    }

    const nx = u.x + dx / dist * u.speed;
    const ny = u.y + dy / dist * u.speed;

    moveUnitWithSlide(u, dx, dy);
  }
}

// 敵AI
function moveRedAI() {
  const alertRange = 180;
  const leashRange = 260;

  for (let u of redUnits) {
    if (!u.alive) continue;
    if (u.blocked) continue;

    const enemy = findNearestEnemy(u, blueUnits);
    if (!enemy) continue;

    const dx = enemy.x - u.x;
    const dy = enemy.y - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 初期位置保存
    if (u.homeX == null) {
      u.homeX = u.x;
      u.homeY = u.y;
    }

    // 射程内ならその場で攻撃
    if (dist <= u.range) continue;

    // 敵が近い時だけ前進して迎撃
    if (dist <= alertRange) {
      const nx = u.x + (dx / dist) * u.speed;
      const ny = u.y + (dy / dist) * u.speed;

      if (!isBlockedTerrain(nx, ny)) {
        u.x = nx;
        u.y = ny;
      }
      continue;
    }

    // 離れたら持ち場へ戻る
    const hx = u.homeX - u.x;
    const hy = u.homeY - u.y;
    const hdist = Math.sqrt(hx * hx + hy * hy);

    if (hdist > 4) {
      const nx = u.x + (hx / hdist) * u.speed;
      const ny = u.y + (hy / hdist) * u.speed;

      if (!isBlockedTerrain(nx, ny)) {
        u.x = nx;
        u.y = ny;
      }
    }

    // 追いかけ過ぎ防止
    if (dist > leashRange && hdist > 2) {
      const nx = u.x + (hx / hdist) * u.speed;
      const ny = u.y + (hy / hdist) * u.speed;

      if (!isBlockedTerrain(nx, ny)) {
        u.x = nx;
        u.y = ny;
      }
    }
  }
}

// =====================
// 戦闘
// =====================
function attackArmy(units, enemies) {
  for (let u of units) {
    if (!u.alive) continue;

    for (let e of enemies) {
      if (!e.alive) continue;

      const dx = e.x - u.x;
      const dy = e.y - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= u.range) {
        u.inBattle = true;
        e.inBattle = true;

        let damage = u.damage;

        if (isOnCapital(e)) damage *= 0.3;
        else if (isOnTown(e)) damage *= 0.5;

        e.hp -= damage;

        if (e.hp <= 0) e.alive = false;

        break;
      }
    }
  }
}

// =====================
// 山侵入禁止 + 川侵入禁止（橋だけ通行可）
// moveToward() 内で使う
// =====================
function isBlockedTerrain(x, y) {

  // 山
  for (let m of mountains) {
    if (isOnMountain(x, y)) return true;
  }

  // 湖
  if (
    x > lake.x &&
    x < lake.x + lake.w &&
    y > lake.y &&
    y < lake.y + lake.h
  ) return true;

  // 川（橋付近以外）
  if (isNearRiver(x, y)) {

    for (let b of bridges) {
      if (
        x > b.x - b.width / 2 - 10 &&
        x < b.x + b.width / 2 + 10 &&
        y > b.y - 26 &&
        y < b.y + 26
      ) {
        return false;
      }
    }

    return true;
  }

  return false;
}

// =====================
// 士気
// =====================
function updateMoraleAll() {
  updateMoraleArmy(blueUnits, redUnits, blueCapital);
  updateMoraleArmy(redUnits, blueUnits, redCapital);
}

function updateMoraleArmy(units, enemies, capital) {
  const alive = units.filter(u => u.alive);

  for (let u of alive) {
    const maxHp = u.type === "soldier" ? 100 : 200;

    const damageTaken = u.lastHp - u.hp;

    if (damageTaken > 0) u.morale -= damageTaken * 0.35;

    u.lastHp = u.hp;

    if (u.hp < maxHp * 0.5) u.morale -= 0.04;

    const nearbyFriend = countNearby(u, alive, 70);
    if (nearbyFriend >= 3) u.morale += 0.03;

    const nearbyEnemy = countNearby(u, enemies, 65);
    if (nearbyEnemy >= 4) u.morale -= 0.18;

    const dx = capital.x - u.x;
    const dy = capital.y - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 80) u.morale += 0.08;

    if (u.morale > 120) u.morale = 120;
    if (u.morale < 0) u.morale = 0;

    if (u.morale <= 20) {
      u.routing = true;
      u.berserk = false;
    }

    if (u.routing && u.morale >= 55) {
      u.routing = false;
    }

    if (u.morale >= 110 && u.hp > maxHp * 0.6) {
      u.berserk = true;
    }

    if (u.morale < 90) {
      u.berserk = false;
    }
  }
}

// =====================
// 補助
// =====================
function countNearby(unit, group, range) {
  let n = 0;

  for (let g of group) {
    if (!g.alive || g === unit) continue;

    const dx = g.x - unit.x;
    const dy = g.y - unit.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range) n++;
  }

  return n;
}

function findNearestEnemy(unit, enemies) {
  let best = null;
  let bestDist = 99999;

  for (let e of enemies) {
    if (!e.alive) continue;

    const dx = e.x - unit.x;
    const dy = e.y - unit.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bestDist) {
      bestDist = dist;
      best = e;
    }
  }

  return best;
}

function separateUnits(units) {
  for (let i = 0; i < units.length; i++) {
    let a = units[i];
    if (!a.alive) continue;

    for (let j = i + 1; j < units.length; j++) {
      let b = units[j];
      if (!b.alive) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 26) {
        const push = (26 - dist) / 2;

        a.x -= dx / dist * push;
        a.y -= dy / dist * push;

        b.x += dx / dist * push;
        b.y += dy / dist * push;
      }
    }
  }
}

function separateMixed(teamA, teamB) {
  for (let a of teamA) {
    if (!a.alive) continue;

    for (let b of teamB) {
      if (!b.alive) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 24) {
        const push = (24 - dist) / 2;

        a.x -= dx / dist * push;
        a.y -= dy / dist * push;

        b.x += dx / dist * push;
        b.y += dy / dist * push;
      }
    }
  }
}

function blockEnemyContact() {
  for (let b of blueUnits) if (b.alive) b.blocked = false;
  for (let r of redUnits) if (r.alive) r.blocked = false;
}

function healUnits() {
  for (let u of [...blueUnits, ...redUnits]) {
    if (!u.alive) continue;

    const maxHp = u.type === "soldier" ? 100 : 200;

    const cap = u.color === "blue" ? blueCapital : redCapital;

    let dx = u.x - cap.x;
    let dy = u.y - cap.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 35) u.hp += 0.06;
    else if (isOnTown(u)) u.hp += 0.03;

    if (u.hp > maxHp) u.hp = maxHp;
  }
}



function keepInsideMap(u) {
  const r = u.type === "artillery" ? 14 : 12;

  if (u.x < r) u.x = r;
  if (u.x > 1000 - r) u.x = 1000 - r;

  if (u.y < r) u.y = r;
  if (u.y > 600 - r) u.y = 600 - r;
}

function isOnTown(unit) {
  for (let t of towns) {
    const dx = unit.x - t.x;
    const dy = unit.y - t.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 25) return true;
  }

  return false;
}

function isOnCapital(unit) {
  const cap = unit.color === "blue" ? blueCapital : redCapital;

  const dx = unit.x - cap.x;
  const dy = unit.y - cap.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist < 35;
}

function checkGameResult() {

  const aliveBlue = blueUnits.filter(u => u.alive);
  const aliveRed = redUnits.filter(u => u.alive);

  // =====================
  // 全滅勝利
  // =====================
  if (aliveRed.length === 0) {
    gameOver = true;
    gameResult = "YOU WIN";
    return;
  }

  if (aliveBlue.length === 0) {
    gameOver = true;
    gameResult = "GAME OVER";
    return;
  }

  // =====================
  // 首都占領勝利
  // =====================

  let blueInRedCapital = 0;
  let redInBlueCapital = 0;

  for (let u of aliveBlue) {
    const dx = u.x - redCapital.x;
    const dy = u.y - redCapital.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) blueInRedCapital++;
  }

  for (let u of aliveRed) {
    const dx = u.x - blueCapital.x;
    const dy = u.y - blueCapital.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) redInBlueCapital++;
  }

  if (blueInRedCapital >= 3) {
    gameOver = true;
    gameResult = "CAPITAL CAPTURED - YOU WIN";
    return;
  }

  if (redInBlueCapital >= 3) {
    gameOver = true;
    gameResult = "YOUR CAPITAL FALLEN";
    return;
  }
}

// =====================
// 操作
// =====================
function applyFormationTargets(cx, cy) {

  const units = selectedUnits.filter(u => u.alive);
  if (units.length === 0) return;

  const spacing = 34;

  // 横隊
  if (currentFormation === "line") {

    const startX = cx - ((units.length - 1) * spacing) / 2;

    for (let i = 0; i < units.length; i++) {
      units[i].targetX = startX + i * spacing;
      units[i].targetY = cy;
    }
  }

  // 縦隊
  else if (currentFormation === "column") {

    const startY = cy - ((units.length - 1) * spacing) / 2;

    for (let i = 0; i < units.length; i++) {
      units[i].targetX = cx;
      units[i].targetY = startY + i * spacing;
    }
  }

  // 円陣
  else if (currentFormation === "circle") {

    const r = Math.max(30, units.length * 6);

    for (let i = 0; i < units.length; i++) {
      const ang = Math.PI * 2 * i / units.length;

      units[i].targetX = cx + Math.cos(ang) * r;
      units[i].targetY = cy + Math.sin(ang) * r;
    }
  }
}

// 山描画
function drawMountains() {

  for (let m of mountains) {

    const cx = m.x + m.w / 2;
    const cy = m.y + m.h / 2;

    // 岩群を複数描く
    drawRock(cx - m.w * 0.25, cy + 10, 26);
    drawRock(cx, cy - 10, 34);
    drawRock(cx + m.w * 0.22, cy + 8, 28);

    drawRock(cx - 18, cy + 22, 20);
    drawRock(cx + 22, cy + 26, 18);
  }
}

// 山の関数
function drawRock(x, y, r) {

  // 本体
  ctx.fillStyle = "#7f7f7f";

  ctx.beginPath();
  ctx.moveTo(x - r, y + r * 0.6);
  ctx.lineTo(x - r * 0.7, y - r * 0.5);
  ctx.lineTo(x - r * 0.2, y - r);
  ctx.lineTo(x + r * 0.6, y - r * 0.7);
  ctx.lineTo(x + r, y + r * 0.2);
  ctx.lineTo(x + r * 0.5, y + r);
  ctx.lineTo(x - r * 0.4, y + r * 0.9);
  ctx.closePath();
  ctx.fill();

  // 影
  ctx.fillStyle = "#5d5d5d";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + r, y + r * 0.2);
  ctx.lineTo(x + r * 0.5, y + r);
  ctx.lineTo(x - r * 0.1, y + r * 0.6);
  ctx.closePath();
  ctx.fill();

  // ハイライト
  ctx.strokeStyle = "#bdbdbd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.3);
  ctx.lineTo(x - r * 0.1, y - r * 0.7);
  ctx.lineTo(x + r * 0.4, y - r * 0.4);
  ctx.stroke();
}

// 山判定（四角形）
function isOnMountain(x, y) {

  for (let m of mountains) {

    const cx = m.x + m.w / 2;
    const cy = m.y + m.h / 2;

    const rx = m.w * 0.42;
    const ry = m.h * 0.38;

    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;

    if (dx * dx + dy * dy <= 1) {
      return true;
    }
  }

  return false;
}

function moveUnitWithSlide(u, dx, dy) {

  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  const stepX = dx / dist * u.speed;
  const stepY = dy / dist * u.speed;

  const nx = u.x + stepX;
  const ny = u.y + stepY;

  // 通常前進できる
  if (!isBlockedTerrain(nx, ny)) {
    u.x = nx;
    u.y = ny;
    return;
  }

  // 横方向だけ試す
  if (!isBlockedTerrain(u.x + stepX, u.y)) {
    u.x += stepX;
    return;
  }

  // 縦方向だけ試す
  if (!isBlockedTerrain(u.x, u.y + stepY)) {
    u.y += stepY;
    return;
  }

  // 左右スライド
  if (!isBlockedTerrain(u.x, u.y + u.speed)) {
    u.y += u.speed;
    return;
  }

  if (!isBlockedTerrain(u.x, u.y - u.speed)) {
    u.y -= u.speed;
    return;
  }
}


canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (gameState === "title") {
    if (
      mx >= startButton.x &&
      mx <= startButton.x + startButton.width &&
      my >= startButton.y &&
      my <= startButton.y + startButton.height
    ) {
      gameState = "play";
      createUnits();
      createSquads();
    }
  }
});

canvas.addEventListener("mousedown", function (e) {

  if (gameState !== "play") return;
  if (e.button !== 0) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // 敵クリックで攻撃命令
  if (selectedUnits.length > 0) {

    for (let enemy of redUnits) {

      if (!enemy.alive) continue;

      const dx = mx - enemy.x;
      const dy = my - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const r = enemy.type === "artillery" ? 14 : 12;

      if (dist <= r + 4) {

        for (let u of selectedUnits) {
          u.attackTarget = enemy;
          u.targetX = null;
          u.targetY = null;
        }

        return;
      }
    }
  }

  // 味方単体選択
  for (let u of blueUnits) {

    if (!u.alive) continue;

    const r = u.type === "artillery" ? 14 : 12;

    const dx = mx - u.x;
    const dy = my - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= r + 4) {
      selectedUnits = [u];
      isDragging = false;
      return;
    }
  }

  // 範囲選択開始
  dragStartX = mx;
  dragStartY = my;
  dragEndX = mx;
  dragEndY = my;
  isDragging = true;
});

canvas.addEventListener("dblclick", function (e) {

  if (gameState !== "play") return;

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let u of blueUnits) {

    if (!u.alive) continue;

    const r = (u.type === "artillery") ? 14 : 12;

    const dx = mx - u.x;
    const dy = my - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= r + 4) {

      // 同兵種全選択
      selectedUnits = blueUnits.filter(v =>
        v.alive &&
        v.type === u.type
      );

      return;
    }
  }

});

canvas.addEventListener("mousemove", function (e) {
  if (!isDragging) return;

  const rect = canvas.getBoundingClientRect();

  dragEndX = e.clientX - rect.left;
  dragEndY = e.clientY - rect.top;
});

canvas.addEventListener("mouseup", function () {
  if (!isDragging) return;

  isDragging = false;
  selectedUnits = [];

  const left = Math.min(dragStartX, dragEndX);
  const right = Math.max(dragStartX, dragEndX);
  const top = Math.min(dragStartY, dragEndY);
  const bottom = Math.max(dragStartY, dragEndY);

  for (let u of blueUnits) {
    if (!u.alive) continue;

    if (
      u.x >= left &&
      u.x <= right &&
      u.y >= top &&
      u.y <= bottom
    ) {
      selectedUnits.push(u);
    }
  }
});

canvas.addEventListener("contextmenu", function (e) {
  e.preventDefault();

  if (gameState !== "play") return;
  if (selectedUnits.length === 0) return;

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (isBlockedTerrain(mx, my)) return;

  applyFormationTargets(mx, my);
});

window.addEventListener("keydown", function (e) {
  if (e.key === "1") currentFormation = "line";
  if (e.key === "2") currentFormation = "column";
  if (e.key === "3") currentFormation = "circle";

  if (e.key === "r" || e.key === "R") location.reload();
});

// =====================
// ループ
// =====================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();