const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let score = 0;
let lives = 3;
let difficulty = "facil";
let bullets = [];
let asteroids = [];
let keys = {};
let ship;
let doubleShot = false;

// Inicializar nave
function initShip() {
  ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    radius: 15,
    cooldown: 0
  };
}

// Criar asteroides irregulares
function createAsteroid(x, y, radius) {
  let points = [];
  let numPoints = 8 + Math.floor(Math.random() * 4);
  for (let i = 0; i < numPoints; i++) {
    let angle = (Math.PI * 2 / numPoints) * i;
    let offset = radius * (0.7 + Math.random() * 0.4);
    points.push({ x: Math.cos(angle) * offset, y: Math.sin(angle) * offset });
  }
  return {
    x, y, radius,
    dx: (Math.random() - 0.5) * (difficulty === "facil" ? 2 : difficulty === "medio" ? 3 : 4),
    dy: (Math.random() - 0.5) * (difficulty === "facil" ? 2 : difficulty === "medio" ? 3 : 4),
    points
  };
}

function spawnAsteroids(num) {
  for (let i = 0; i < num; i++) {
    asteroids.push(createAsteroid(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      30 + Math.random() * 20
    ));
  }
}

// Iniciar jogo
function startGame(level) {
  difficulty = level;
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("hud").style.display = "block";
  document.getElementById("gameOver").style.display = "none";
  score = 0;
  lives = 3;
  bullets = [];
  asteroids = [];
  doubleShot = false;
  initShip();
  spawnAsteroids(difficulty === "facil" ? 5 : difficulty === "medio" ? 8 : 12);
  update();
}

// Loop principal
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Movimento WASD mais rápido e responsivo
  let moveSpeed = 5;
  let rotateSpeed = 0.1;

  if (keys["w"]) {
    ship.x += Math.cos(ship.angle) * moveSpeed;
    ship.y += Math.sin(ship.angle) * moveSpeed;
  }
  if (keys["s"]) {
    ship.x -= Math.cos(ship.angle) * moveSpeed;
    ship.y -= Math.sin(ship.angle) * moveSpeed;
  }
  if (keys["a"]) ship.angle -= rotateSpeed;
  if (keys["d"]) ship.angle += rotateSpeed;

  // Wrap-around
  if (ship.x < 0) ship.x = canvas.width;
  if (ship.x > canvas.width) ship.x = 0;
  if (ship.y < 0) ship.y = canvas.height;
  if (ship.y > canvas.height) ship.y = 0;

  // Nave
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.beginPath();
  ctx.moveTo(ship.radius, 0);
  ctx.lineTo(-ship.radius, ship.radius / 2);
  ctx.lineTo(-ship.radius, -ship.radius / 2);
  ctx.closePath();
  ctx.strokeStyle = "#b84cff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.restore();

  // Tiros
  bullets.forEach((b, i) => {
    b.x += Math.cos(b.angle) * (doubleShot ? 12 : 8);
    b.y += Math.sin(b.angle) * (doubleShot ? 12 : 8);

    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#8A2BE2";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.fill();

    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });

  // Asteroides
  asteroids.forEach((a, ai) => {
    a.x += a.dx;
    a.y += a.dy;

    if (a.x < 0) a.x = canvas.width;
    if (a.x > canvas.width) a.x = 0;
    if (a.y < 0) a.y = canvas.height;
    if (a.y > canvas.height) a.y = 0;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.beginPath();
    ctx.moveTo(a.points[0].x, a.points[0].y);
    for (let p of a.points) ctx.lineTo(p.x, p.y);
    ctx.closePath();
    ctx.strokeStyle = "#888";
    ctx.shadowColor = "#b84cff";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // Colisão nave
    let distShip = Math.hypot(ship.x - a.x, ship.y - a.y);
    if (distShip < ship.radius + a.radius) {
      lives--;
      document.getElementById("lives").textContent = lives;
      ship.x = canvas.width / 2;
      ship.y = canvas.height / 2;
      if (lives <= 0) {
        gameOver();
      }
    }

    // Colisão tiro
    bullets.forEach((b, bi) => {
      let dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (dist < a.radius) {
        bullets.splice(bi, 1);
        asteroids.splice(ai, 1);
        score += 10;
        document.getElementById("score").textContent = score;

        if (score >= 200) {
          doubleShot = true;
        }

        if (a.radius > 20) {
          asteroids.push(createAsteroid(a.x, a.y, a.radius / 2));
          asteroids.push(createAsteroid(a.x, a.y, a.radius / 2));
        }
      }
    });
  });

  requestAnimationFrame(update);
}

// Tela de Game Over
function gameOver() {
  canvas.style.display = "none";
  document.getElementById("hud").style.display = "none";
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("finalScore").textContent = score;
}

function retryGame() {
  document.getElementById("gameOver").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("hud").style.display = "block";
  score = 0;
  lives = 3;
  bullets = [];
  asteroids = [];
  doubleShot = false;
  initShip();
  spawnAsteroids(difficulty === "facil" ? 5 : difficulty === "medio" ? 8 : 12);
  update();
}

function goToMenu() {
  document.getElementById("gameOver").style.display = "none";
  canvas.style.display = "none";
  document.getElementById("hud").style.display = "none";
  document.getElementById("menu").style.display = "block";
}

// Controles
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousedown", e => {
  if (e.button === 0) {
    if (doubleShot) {
      bullets.push({ x: ship.x, y: ship.y, angle: ship.angle + 0.1 });
      bullets.push({ x: ship.x, y: ship.y, angle: ship.angle - 0.1 });
    } else {
      bullets.push({ x: ship.x, y: ship.y, angle: ship.angle });
    }
  }
});
