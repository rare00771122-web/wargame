const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameState = "title";
let gameOver = false;
let gameResult = "";

let selectedUnits = [];

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragEndX = 0;
let dragEndY = 0;

// STARTボタン
const startButton = {
  x: 400,
  y: 320,
  width: 200,
  height: 70
};

// 拠点
const blueCapital = { x: 80, y: 300 };
const redCapital = { x: 920, y: 300 };

const towns = [
  { x: 300, y: 150},
  { x: 300, y: 450},
  { x: 500, y: 300},
  { x: 700, y: 150},
  { x: 700, y: 450}
];

// ユニット
const blueUnits = [];
const redUnits = [];

// 初期配置
function createUnits() {

  // 青兵士17
  for (let i = 0; i < 17; i++) {
    blueUnits.push({
      x: 120 + (i % 5) * 35,
      y: 180 + Math.floor(i / 5) * 55,
      type: "soldier",
      color: "blue",
      hp: 100,
      speed: 0.45,
      range: 28,
      damage: 0.18,
      alive: true,
      targetX: null,
      targetY: null,
      blocked: false,
    });
  }

  // 青砲兵3
  for (let i = 0; i < 3; i++) {
    blueUnits.push({
      x: 150,
      y: 430 + i * 45,
      type: "artillery",
      color: "blue",
      hp: 180,
      speed: 0.22,
      range: 110,
      damage: 0.35,
      alive: true,
      targetX: null,
      targetY: null,
      blocked: false,
    });
  }

  // 赤兵士17
  for (let i = 0; i < 17; i++) {
    redUnits.push({
      x: 880 - (i % 5) * 35,
      y: 180 + Math.floor(i / 5) * 55,
      type: "soldier",
      color: "red",
      hp: 100,
      speed: 0.45,
      range: 28,
      damage: 0.18,
      alive: true,
      blocked: false,
    });
  }

  // 赤砲兵3
  for (let i = 0; i < 3; i++) {
    redUnits.push({
      x: 850,
      y: 430 + i * 45,
      type: "artillery",
      color: "red",
      hp: 180,
      speed: 0.22,
      range: 110,
      damage: 0.35,
      alive: true,
      blocked: false,
    });
  }

}

// 背景
function drawMap() {
  ctx.fillStyle = "#2f8f2f";
  ctx.fillRect(0, 0, 1000, 600);
}

// 星描画
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

  ctx.fillStyle = color;
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = "yellow";
  ctx.stroke();
}

// 首都
function drawCapitals() {
  drawStar(blueCapital.x, blueCapital.y, 28, "blue");
  drawStar(redCapital.x, redCapital.y, 28, "red");
}

// 町
function drawTowns() {
  for (let t of towns) {
    ctx.fillStyle = "yellow";

    ctx.beginPath();
    ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ユニット描画
function drawUnits(units) {

  for (let u of units) {

    if (!u.alive) continue;

    ctx.fillStyle = u.color;

    if (u.type === "soldier") {
      ctx.beginPath();
      ctx.arc(u.x, u.y, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    if (u.type === "artillery") {
      ctx.beginPath();
      ctx.arc(u.x, u.y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(u.x, u.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    if (selectedUnits.includes(u)) {

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(u.x, u.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawHpBar(
      u.x,
      u.y,
      u.hp,
      u.type === "soldier" ? 100 : 180
    );
  }
}

// タイトル画面
function drawTitle() {

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1000, 600);

  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("WAR GAME", 500, 180);

  ctx.fillStyle = "darkblue";
  ctx.fillRect(
    startButton.x,
    startButton.y,
    startButton.width,
    startButton.height
  );

  ctx.fillStyle = "white";
  ctx.font = "36px sans-serif";
  ctx.fillText("START", 500, 365);

  ctx.textAlign = "left";
}

// 描画
function draw() {

  if (gameState === "title") {
    drawTitle();
    return;
  }

  drawMap();
  drawTowns();
  drawCapitals();

  drawUnits(blueUnits);
  drawUnits(redUnits);

  if (gameOver) {

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 1000, 600);

    ctx.fillStyle = "white";
    ctx.font = "64px sans-serif";
    ctx.textAlign = "center";
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
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }
}

// ループ
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

canvas.addEventListener("contextmenu", function (e) {

  e.preventDefault();

  if (gameState !== "play") return;
  if (selectedUnits.length === 0) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let u of selectedUnits) {

    u.targetX = mx + Math.random() * 40 - 20;
    u.targetY = my + Math.random() * 40 - 20;
  }

});

// マウス押下イベント
canvas.addEventListener("mouseup", function (e) {

  if (gameState !== "play") return;
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

// STARTクリック
canvas.addEventListener("click", function (e) {

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // タイトル画面
  if (gameState === "title") {

    if (
      mx >= startButton.x &&
      mx <= startButton.x + startButton.width &&
      my >= startButton.y &&
      my <= startButton.y + startButton.height
    ) {
      gameState = "play";
      createUnits();
    }

    return;
  }
});

canvas.addEventListener("mousedown", function (e) {

  if (gameState !== "play") return;
  if (e.button !== 0) return;

  const rect = canvas.getBoundingClientRect();

  dragStartX = e.clientX - rect.left;
  dragStartY = e.clientY - rect.top;

  dragEndX = dragStartX;
  dragEndY = dragStartY;

  isDragging = true;

});

canvas.addEventListener("mousemove", function (e) {

  if (!isDragging) return;

  const rect = canvas.getBoundingClientRect();

  dragEndX = e.clientX - rect.left;
  dragEndY = e.clientY - rect.top;

});

// 更新
function update() {

  if (gameState !== "play") return;
  if (gameOver) return;

  // 移動
  moveBluePlayer();
  moveRedAI();

  // 味方同士の重なり防止
  separateUnits(blueUnits);
  separateUnits(redUnits);

  // 接触判定
  blockEnemyContact();

  // 敵味方の押し合い
  separateMixed(blueUnits, redUnits);

  // その後に戦闘
  attackArmy(blueUnits, redUnits);
  attackArmy(redUnits, blueUnits);

  checkGameResult();
}

// HPバー
function drawHpBar(x, y, hp, maxHp) {

  ctx.fillStyle = "black";
  ctx.fillRect(x - 14, y - 18, 28, 4);

  ctx.fillStyle = "lime";
  ctx.fillRect(x - 14, y - 18, 28 * (hp / maxHp), 4);
}

// 攻撃処理
function attackArmy(units, enemies) {

  for (let u of units) {

    if (!u.alive) continue;

    for (let e of enemies) {

      if (!e.alive) continue;

      const dx = e.x - u.x;
      const dy = e.y - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= u.range) {

        let damage = u.damage;

        // 首都防御（最優先）
        if (isOnCapital(e)) {
          damage *= 0.3;
        }

        // 町防御
        else if (isOnTown(e)) {
          damage *= 0.5;
        }

        e.hp -= damage;

        if (e.hp <= 0) {
          e.alive = false;
        }

        break;
      }
    }

  }

}

// 勝敗判定
function checkGameResult() {

  if (gameOver) return;

  const aliveBlue = blueUnits.filter(u => u.alive);
  const aliveRed = redUnits.filter(u => u.alive);

  // 全滅判定
  if (aliveRed.length === 0) {
    gameOver = true;
    gameResult = "YOU WIN";
  }

  if (aliveBlue.length === 0) {
    gameOver = true;
    gameResult = "GAME OVER";
  }

  // 首都到達判定
  for (let u of aliveBlue) {

    const dx = u.x - redCapital.x;
    const dy = u.y - redCapital.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 35) {
      gameOver = true;
      gameResult = "YOU WIN";
    }
  }

  for (let u of aliveRed) {

    const dx = u.x - blueCapital.x;
    const dy = u.y - blueCapital.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 35) {
      gameOver = true;
      gameResult = "GAME OVER";
    }
  }

}

// Rキー再起動
window.addEventListener("keydown", function (e) {

  if (e.key === "r" || e.key === "R") {
    location.reload();
  }

});

// 町判定
function isOnTown(unit) {

  for (let t of towns) {

    const dx = unit.x - t.x;
    const dy = unit.y - t.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 25) {
      return true;
    }
  }

  return false;
}

// 首都判定
function isOnCapital(unit) {

  let targetCapital =
    unit.color === "blue" ? blueCapital : redCapital;

  const dx = unit.x - targetCapital.x;
  const dy = unit.y - targetCapital.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist < 35;
}


// 敵専用移動関数
function moveRedAI() {

  for (let u of redUnits) {

    if (!u.alive) continue;
    if (u.blocked) continue;

    let nearestEnemy = null;
    let minEnemyDist = 99999;

    for (let b of blueUnits) {
      if (!b.alive) continue;

      const dx = b.x - u.x;
      const dy = b.y - u.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < minEnemyDist) {
        minEnemyDist = dist;
        nearestEnemy = b;
      }
    }

    if (nearestEnemy && minEnemyDist <= u.range) continue;

    // 青首都へ進軍
    const dx = blueCapital.x - u.x;
    const dy = blueCapital.y - u.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 3) {
      u.x += dx / dist * u.speed;
      u.y += dy / dist * u.speed;
    }
  }
}

// 青軍専用移動関数
function moveBluePlayer() {

  for (let u of blueUnits) {

    if (!u.alive) continue;

    if (u.blocked) {
      if (u.targetX != null && u.targetX < u.x) {
        // 後退なのでOK
      } else {
        continue;
      }
    }

    // 命令移動優先
    if (u.targetX != null && u.targetY != null) {

      const dx = u.targetX - u.x;
      const dy = u.targetY - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {

        u.x += (dx / dist) * u.speed;
        u.y += (dy / dist) * u.speed;

      } else {

        u.targetX = null;
        u.targetY = null;

      }

    } else {

      // 命令なければ自動前進
      u.x += u.speed;

    }

  }

}

function separateUnits(units) {

  for (let i = 0; i < units.length; i++) {

    let a = units[i];
    if (!a.alive) continue;

    for (let j = i + 1; j < units.length; j++) {

      let b = units[j];
      if (!b.alive) continue;

      if (a.blocked || b.blocked) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const minDist = 26;

      if (dist > 0 && dist < minDist) {

        const push = (minDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;

        a.x -= nx * push;
        a.y -= ny * push;

        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }
}

// 敵味方の押し合い
function separateMixed(teamA, teamB) {

  for (let a of teamA) {
    if (!a.alive) continue;

    for (let b of teamB) {
      if (!b.alive) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const minDist = 24;

      if (dist > 0 && dist < minDist) {

        const push = (minDist - dist) / 2;

        const nx = dx / dist;
        const ny = dy / dist;

        a.x -= nx * push;
        a.y -= ny * push;

        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }
}

// 毎フレーム接触判定
function blockEnemyContact() {

  for (let b of blueUnits) {
    if (!b.alive) continue;
    b.blocked = false;
  }

  for (let r of redUnits) {
    if (!r.alive) continue;
    r.blocked = false;
  }

  for (let b of blueUnits) {
    if (!b.alive) continue;

    for (let r of redUnits) {
      if (!r.alive) continue;

      const dx = r.x - b.x;
      const dy = r.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 24) {

        // 青軍が敵へ向かってるなら停止
        if (b.targetX == null || b.targetX > b.x) {
          b.blocked = true;
        }

        // 赤軍は常に前進なので停止
        r.blocked = true;
      }
    }
  }
}