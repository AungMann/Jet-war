document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // --- ASSET LOADING ---
  // Make sure you have these files in the correct folders
  const heroImg = new Image();
  heroImg.src = "images/hero1.png";

  const enemyImages = {
    basic: new Image(),
    tank: new Image(),
    fast: new Image(),
    shooter: new Image(),
    boss: new Image(),
  };
  enemyImages.basic.src = "images/enemy_basic.png";
  enemyImages.tank.src = "images/enemy_tank.png";
  enemyImages.fast.src = "images/enemy_fast.png";
  enemyImages.shooter.src = "images/enemy_shooter.png";
  enemyImages.boss.src = "images/boss.png";

  const shootSound = new Audio("sounds/shoot.mp3");
  const explosionSound = new Audio("sounds/explosion.mp3");

  // --- GAME STATE VARIABLES ---
  let keys = {};
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let powerUps = [];
  let health = 100;
  let gameOver = false;
  let score = 0;
  let gameStarted = false;
  let level = 1;
  let enemySpeedMultiplier = 1;
  let pausedForLevel = false;
  let lastEnemyShootTime = 0;
  const enemyShootCooldown = 2500; // in milliseconds
  let lastHeroShootTime = 0;
  const heroShootCooldown = 100; // in milliseconds
  let isPaused = false;
  let enemiesSpawned = 0;
  let enemiesToSpawn = 10;



  function getScoreThresholdForLevel(level) {
    return 100 + (level - 1) * 200;
  }
  let scoreToNextLevel = getScoreThresholdForLevel(1);


  const hero = {
    x: 160,
    y: 540,
    width: 40,
    height: 40,
    speed: 4,
  };

  // --- SPAWNING FUNCTIONS ---
  function spawnEnemy(x = Math.random() * (canvas.width - 40), y = -40, type = "basic") {
    if (enemiesSpawned >= enemiesToSpawn) return; // 💡 Respect per-level limit

    let enemy = { x, y, width: 40, height: 40, dy: (0.3 + Math.random() * 0.5) * enemySpeedMultiplier, type, health: 30, damage: 10, flash: 0 };
    if (type === "tank") {
      enemy.health = 60;
      enemy.dy *= 0.7;
    } else if (type === "fast") {
      enemy.health = 20;
      enemy.dy *= 1.5;
    } else if (type === "shooter") {
      enemy.health = 40;
    }
    enemies.push(enemy);
    enemiesSpawned++;
  }



  function spawnBoss() {
    enemies.push({
      x: canvas.width / 2 - 40,
      y: 60, // fixed base line
      width: 80,
      height: 80,
      dy: 0, // no vertical movement
      dx: 1.5, // horizontal speed
      type: "boss",
      health: 200,
      damage: 20,
      flash: 0
    });
  }
  function spawnBossAt(x, y) {
    enemies.push({
      x: x,
      y: y,
      width: 80,
      height: 80,
      dy: 0,
      dx: 1.5 * (Math.random() < 0.5 ? -1 : 1), // Random left/right start
      type: "boss",
      health: 200,
      damage: 20,
      flash: 0
    });
  }


  function spawnPowerUp(x, y, type = "health") {
    powerUps.push({ x, y, width: 30, height: 30, type, dy: 2 });
  }

  // --- EVENT LISTENERS ---
  document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    gameStarted = true;
    for (let i = 0; i < 4; i++) spawnEnemy(i * 80 + 20, 20);
    gameLoop();
  });
  document.addEventListener("keydown", (e) => {
  if (e.code === "KeyP") {
    isPaused = !isPaused;
    if (!isPaused && !gameOver) gameLoop(); // resume
  }
  });

  document.getElementById("continueBtn").addEventListener("click", () => {
    document.getElementById("level-complete").style.display = "none";
    pausedForLevel = false;
    gameLoop();
  });
  document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  if (!isPaused && !gameOver) gameLoop();
});

  document.getElementById("restartBtn").addEventListener("click", () => {
    gameOver = false;
    health = 100;
    score = 0;
    level = 1;
    scoreToNextLevel = 100;
    enemySpeedMultiplier = 1;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    powerUps = [];
    keys = {};
    pausedForLevel = false;
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("level").textContent = "Level: 1";
    document.getElementById("restartBtn").style.display = "none";
    gameStarted = true;
    for (let i = 0; i < 4; i++) spawnEnemy(i * 80 + 20, 20);
    gameLoop();
  });

  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if ((e.code === "Space" || e.code === "ArrowUp") && !gameOver && gameStarted) shootBullet();
  });
  document.addEventListener("keyup", (e) => (keys[e.code] = false));

const setupButton = (btnId, key) => {
  const btn = document.getElementById(btnId);

  const activate = () => {
    btn.classList.add("active");
    keys[key] = true;
  };
  const deactivate = () => {
    btn.classList.remove("active");
    keys[key] = false;
  };

  btn.addEventListener("mousedown", activate);
  btn.addEventListener("mouseup", deactivate);
  btn.addEventListener("mouseleave", deactivate);
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    activate();
  });
  btn.addEventListener("touchend", (e) => {
    e.preventDefault();
    deactivate();
  });
};

  setupButton("leftBtn", "ArrowLeft");
  setupButton("rightBtn", "ArrowRight");
  document.getElementById("shootBtn").addEventListener("click", shootBullet);

  // --- SHOOTING ---
function shootBullet() {
  const now = Date.now();
  if (!gameStarted || gameOver || pausedForLevel) return;

  if (now - lastHeroShootTime < heroShootCooldown) return; // Cooldown block

  lastHeroShootTime = now; // Update time
  shootSound.play().catch(e => console.log("Sound play failed"));

  bullets.push({
    x: hero.x + hero.width / 2 - 2,
    y: hero.y,
    width: 4,
    height: 10
  });
}


  function shootEnemyBullets() {
    if (!gameStarted || gameOver || pausedForLevel) return;

    enemies.forEach((enemy) => {
      if (enemy.type === "shooter") {
        // Shooter enemies fire one bullet
        enemyBullets.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 10,
        });
      }

      if (enemy.type === "boss") {
        // Boss enemy fires 3 bullets in spread pattern
        const centerX = enemy.x + enemy.width / 2;
        const bulletY = enemy.y + enemy.height;
        const bulletWidth = 4;
        const bulletHeight = 10;

        enemyBullets.push(
          { x: centerX - 12, y: bulletY, width: bulletWidth, height: bulletHeight },
          { x: centerX,      y: bulletY, width: bulletWidth, height: bulletHeight },
          { x: centerX + 12, y: bulletY, width: bulletWidth, height: bulletHeight }
        );
      }
    });
  }

  setInterval(shootEnemyBullets, 2500);

  // --- COLLISION CHECK ---
  function checkCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  // --- UPDATE AND DRAW FUNCTIONS ---
  function updateAndDraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hero movement
  if (keys["ArrowLeft"] && hero.x > 0) hero.x -= hero.speed;
  if (keys["ArrowRight"] && hero.x + hero.width < canvas.width) hero.x += hero.speed;
  ctx.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);

  // Draw control line (optional for visual debug)
  ctx.strokeStyle = "cyan";
  ctx.beginPath();
  ctx.moveTo(0, hero.y + hero.height);
  ctx.lineTo(canvas.width, hero.y + hero.height);
  ctx.stroke();

  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy.type === "boss") {
      enemy.x += enemy.dx;

      // Bounce boss off canvas edges
      if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.dx *= -1;
      }
    } else {
      enemy.y += enemy.dy;
    }


    if (checkCollision(enemy, hero)) {
      health -= enemy.damage;
      enemies.splice(i, 1);
      spawnEnemy();
      if (health <= 0) { health = 0; gameOver = true; }
      continue;
    }

    // NEW: Damage hero if enemy passes the hero's control line
    if (enemy.y > hero.y + hero.height) {
      health = Math.max(0, health - 10); // fixed 10 units loss
      enemies.splice(i, 1);
      spawnEnemy();
      if (health <= 0) { gameOver = true; }
      continue;
    }

    const img = enemyImages[enemy.type] || enemyImages.basic;
    if (enemy.flash > 0) { ctx.globalAlpha = 0.5; enemy.flash--; }
    ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.globalAlpha = 1.0;

    const maxHealth = enemy.type === "boss" ? 200 : (enemy.type === "tank" ? 60 : (enemy.type === "shooter" ? 40 : 30));
    ctx.fillStyle = "white"; ctx.fillRect(enemy.x, enemy.y - 6, enemy.width, 4);
    ctx.fillStyle = "red"; ctx.fillRect(enemy.x, enemy.y - 6, (enemy.health / maxHealth) * enemy.width, 4);
  }

  // Hero Bullets
for (let i = bullets.length - 1; i >= 0; i--) {
  const b = bullets[i];
  b.y -= 6;
  let bulletHit = false;

  for (let j = enemies.length - 1; j >= 0; j--) {
    const enemy = enemies[j];
    if (checkCollision(b, enemy)) {
      bullets.splice(i, 1);
      enemy.health -= 10;
      enemy.flash = 5;

      // 🔽 PLACE THE CODE HERE
      if (enemy.health <= 0) {
        explosionSound.play().catch(e => console.log("Sound play failed"));
        if (enemy.type === "boss") {
          spawnPowerUp(enemy.x, enemy.y, "health");
          spawnPowerUp(enemy.x + 40, enemy.y, "score");
          score += 50;
        }
        enemies.splice(j, 1);
        score += 10;
        document.getElementById("score").textContent = `Score: ${score}`;

        // 🟢 Spawn next enemy only if within quota
        if (enemiesSpawned < enemiesToSpawn) spawnEnemy();

        checkLevelProgression();
      }

      bulletHit = true;
      break;
    }
  }

  if (b.y < 0 && !bulletHit) {
    bullets.splice(i, 1);
  } else {
    ctx.fillStyle = "yellow";
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }
}


  // Enemy Bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.y += 3;
    if (checkCollision(b, hero)) {
      health -= 10;
      enemyBullets.splice(i, 1);
      if (health <= 0) { health = 0; gameOver = true; }
      continue;
    }
    if (b.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }

  // Power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.y += p.dy;
    if (checkCollision(p, hero)) {
      if (p.type === "health") health = Math.min(100, health + 30);
      else if (p.type === "score") {
        score += 50;
        document.getElementById("score").textContent = `Score: ${score}`;
      }
      powerUps.splice(i, 1);
      continue;
    }
    if (p.y > canvas.height) {
      powerUps.splice(i, 1);
      continue;
    }
    ctx.fillStyle = p.type === "health" ? "lime" : "gold";
    ctx.beginPath(); ctx.arc(p.x + 15, p.y + 15, 15, 0, Math.PI * 2); ctx.fill();
  }

    // UI - health bar
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Health: ${health}`, 10, 20);  // Show numeric value
    ctx.strokeStyle = "white";
    ctx.strokeRect(10, 30, 100, 10);
    ctx.fillStyle = "lime";
    ctx.fillRect(10, 30, health, 10);


  // Boss health bar
  drawBossHealthBars();

}

  function drawBossHealthBars() {
  const bosses = enemies.filter(e => e.type === "boss");
  const barWidth = 100;
  const barHeight = 10;
  const gap = 15;

  bosses.forEach((boss, index) => {
    const maxHealth = 200;
    const x = 10;
    const y = 60 + index * (barHeight + gap);

    ctx.fillStyle = "white";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "purple";
    ctx.fillRect(x, y, (boss.health / maxHealth) * barWidth, barHeight);

    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.font = "14px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`BOSS ${index + 1}`, x, y - 2);
  });
}

  function checkLevelProgression() {
    if (score >= scoreToNextLevel) {
      level++;
      enemySpeedMultiplier += 0.2;
      scoreToNextLevel = getScoreThresholdForLevel(level);
      document.getElementById("level").textContent = `Level: ${level}`;
      
      enemiesToSpawn = 10 + level * 8;
      enemiesSpawned = 0;
      
      enemies = [];
      pausedForLevel = true;
      document.getElementById("currentLevelDisplay").textContent = level - 1;
      document.getElementById("level-complete").style.display = "block";

      setTimeout(() => {
        if (level % 3 === 0) {
          const numBosses = Math.floor(level / 3); // 1 boss at level 3, 2 at 6, 3 at 9...
          for (let i = 0; i < numBosses; i++) {
            const spacing = canvas.width / (numBosses + 1);
            const x = spacing * (i + 1) - 40; // space evenly across canvas
            spawnBossAt(x, 60); // fixed Y line
          }
        } else {
          spawnEnemiesForLevel(level);
        }
      }, 500);
    }
  }

  function spawnEnemiesForLevel(level) {
    const basicCount = 3 + Math.floor(level / 6);
    const tankCount = Math.floor(level / 9);
    const fastCount = Math.floor(level / 9);
    const shooterCount = Math.floor(level / 1.5); // shooter increases fastest

    for (let i = 0; i < basicCount; i++) spawnEnemy(undefined, -40, "basic");
    for (let i = 0; i < tankCount; i++) spawnEnemy(undefined, -40, "tank");
    for (let i = 0; i < fastCount; i++) spawnEnemy(undefined, -40, "fast");
    for (let i = 0; i < shooterCount; i++) spawnEnemy(undefined, -40, "shooter");
  }


  function gameLoop() {
    if (gameOver) {
      ctx.fillStyle = "red";
      ctx.font = "32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      document.getElementById("restartBtn").style.display = "block";
      return;
    }

    if (!gameStarted || pausedForLevel) return;

    // Check if paused
    if (isPaused) {
      ctx.fillStyle = "yellow";
      ctx.font = "28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
      return; // Don't call requestAnimationFrame if paused
    }

    const now = Date.now();
    if (now - lastEnemyShootTime > enemyShootCooldown) {
      shootEnemyBullets();
      lastEnemyShootTime = now;
    }

    updateAndDraw();

    // Continue game loop
    requestAnimationFrame(gameLoop);
  }

});