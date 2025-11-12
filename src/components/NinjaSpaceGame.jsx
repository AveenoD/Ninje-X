import React, { useEffect, useRef, useState } from 'react';

function NinjaSpaceGame() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const gameStateRef = useRef(null);
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // Load high score from state
    const saved = window.storage ? window.storage.get('ninjaspace_highscore').catch(() => null) : null;
    if (saved) {
      saved.then(result => {
        if (result) {
          setHighScore(parseInt(result.value) || 0);
        }
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const FPS = 60;
    const FRAME_TIME = 1000 / FPS;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    let audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
    let isMuted = false;

    const playSound = (freq, duration, type = 'square', volume = 0.05) => {
      if (isMuted || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    };

    const sounds = {
      shoot: () => playSound(800, 0.05, 'square', 0.05),
      hit: () => playSound(200, 0.1, 'sawtooth', 0.08),
      explosion: () => {
        playSound(100, 0.2, 'sawtooth', 0.1);
        setTimeout(() => playSound(50, 0.15, 'sawtooth', 0.08), 50);
      },
      powerup: () => {
        playSound(600, 0.1, 'sine', 0.06);
        setTimeout(() => playSound(800, 0.1, 'sine', 0.06), 100);
      },
      gameOver: () => {
        playSound(400, 0.3, 'triangle', 0.1);
        setTimeout(() => playSound(300, 0.3, 'triangle', 0.1), 150);
        setTimeout(() => playSound(200, 0.5, 'triangle', 0.1), 300);
      }
    };

    const projectilePool = [];
    const explosionPool = [];
    const powerupPool = [];
    const enemyPool = [];

    const getFromPool = (pool, defaultObj) => {
      let obj = pool.find(o => !o.active);
      if (!obj) {
        obj = { ...defaultObj, active: true };
        pool.push(obj);
      } else {
        Object.assign(obj, defaultObj);
        obj.active = true;
      }
      return obj;
    };

    const game = {
      player: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 40,
        width: 20,
        height: 20,
        speed: 4,
        lives: 3,
        invulnerable: false,
        invulnerableTime: 0,
        rapidFire: false,
        rapidFireTime: 0,
        multiShot: false,
        multiShotTime: 0
      },
      projectiles: projectilePool,
      enemies: [],
      explosions: explosionPool,
      powerups: powerupPool,
      score: 0,
      wave: 1,
      level: 1,
      enemiesSpawned: 0,
      enemiesKilled: 0,
      shootCooldown: 0,
      keys: {},
      paused: false,
      gameOver: false,
      time: 0,
      waveTimer: 0,
      enemySpawnRate: 0,
      nextEnemySpawn: 0,
      levelUpTime: 0,
      waveUpTime: 0
    };

    gameStateRef.current = game;

    const handleKeyDown = (e) => {
      if (!e || !e.key) return;
      
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        game.keys['space'] = true;
      }
      if (e.key.toLowerCase() === 'arrowleft') game.keys['arrowleft'] = true;
      if (e.key.toLowerCase() === 'arrowright') game.keys['arrowright'] = true;
      if (e.key.toLowerCase() === 'a') game.keys['a'] = true;
      if (e.key.toLowerCase() === 'd') game.keys['d'] = true;
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePause();
      }
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        isMuted = !isMuted;
      }
      
      // SECRET CHEAT CODES - ONLY YOU KNOW! 🤫
      if (e.key.toLowerCase() === 'g') {
        // GOD MODE - Invulnerable forever
        game.player.invulnerable = !game.player.invulnerable;
        game.player.invulnerableTime = game.player.invulnerable ? 999999 : 0;
        console.log(game.player.invulnerable ? '🛡️ GOD MODE ON' : '🛡️ GOD MODE OFF');
      }
      if (e.key.toLowerCase() === 'k') {
        // KILL ALL - Destroy all enemies
        game.enemies.forEach(enemy => {
          if (enemy.active) {
            createExplosion(enemy.x, enemy.y, 40);
            game.score += enemy.type === 'tank' ? 50 : enemy.type === 'fast' ? 30 : 20;
            game.enemiesKilled++;
            enemy.active = false;
          }
        });
        sounds.explosion();
        console.log('💥 ALL ENEMIES DESTROYED');
      }
      if (e.key.toLowerCase() === 'i') {
        // INSTANT LEVEL UP
        game.level++;
        game.levelUpTime = 120;
        console.log(`⬆️ LEVEL UP TO ${game.level}`);
      }
      if (e.key.toLowerCase() === 'w') {
        // WAVE JUMP
        game.wave++;
        game.waveUpTime = 120;
        console.log(`🌊 WAVE UP TO ${game.wave}`);
      }
      if (e.key.toLowerCase() === 'c') {
        // CASH BOOST - Add 1000 points
        game.score += 1000;
        console.log('💰 +1000 POINTS');
      }
      if (e.key.toLowerCase() === 'l') {
        // EXTRA LIFE
        game.player.lives++;
        console.log(`❤️ LIVES: ${game.player.lives}`);
      }
      if (e.key.toLowerCase() === 'x') {
        // MAX POWER - All powerups active
        game.player.rapidFireTime = 500;
        game.player.multiShotTime = 500;
        console.log('⚡ MAX POWER ACTIVATED');
      }
    };

    const handleKeyUp = (e) => {
      if (!e || !e.key) return;
      
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        game.keys['space'] = false;
      }
      if (e.key.toLowerCase() === 'arrowleft') game.keys['arrowleft'] = false;
      if (e.key.toLowerCase() === 'arrowright') game.keys['arrowright'] = false;
      if (e.key.toLowerCase() === 'a') game.keys['a'] = false;
      if (e.key.toLowerCase() === 'd') game.keys['d'] = false;
    };

    let touchStartX = 0;
    let isTouching = false;

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches?.[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const x = (touch.clientX - rect.left) * scaleX;
      touchStartX = x;
      isTouching = true;
      game.player.x = Math.max(10, Math.min(GAME_WIDTH - 10, x));
      shoot();
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!isTouching) return;
      const touch = e.touches?.[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const x = (touch.clientX - rect.left) * scaleX;
      game.player.x = Math.max(10, Math.min(GAME_WIDTH - 10, x));
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      isTouching = false;
    };

    const togglePause = () => {
      game.paused = !game.paused;
    };

    const shoot = () => {
      if (game.gameOver || game.paused || game.shootCooldown > 0) return;
      const cooldown = game.player.rapidFire ? 4 : 12;
      game.shootCooldown = cooldown;
      sounds.shoot();

      if (game.player.multiShot) {
        createProjectile(game.player.x - 10, game.player.y - 5, -9);
        createProjectile(game.player.x, game.player.y - 10, -9);
        createProjectile(game.player.x + 10, game.player.y - 5, -9);
      } else {
        createProjectile(game.player.x, game.player.y - 10, -9);
      }
    };

    const createProjectile = (x, y, vy) => {
      const proj = getFromPool(projectilePool, {
        x: x,
        y: y,
        vy: vy,
        width: 4,
        height: 10,
        active: true
      });
      proj.x = x;
      proj.y = y;
      proj.vy = vy;
      proj.active = true;
    };

    const createExplosion = (x, y, size = 25) => {
      const exp = getFromPool(explosionPool, {
        x: 0,
        y: 0,
        size: 0,
        life: 0,
        maxLife: 0,
        active: false
      });
      exp.x = x;
      exp.y = y;
      exp.size = size;
      exp.life = 20;
      exp.maxLife = 20;
      exp.active = true;
    };

    const createPowerup = (x, y, type) => {
      const powerup = getFromPool(powerupPool, {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 14,
        height: 14,
        type: '',
        active: false
      });
      powerup.x = x;
      powerup.y = y;
      powerup.vx = (Math.random() - 0.5) * 1.5;
      powerup.vy = 0.8;
      powerup.type = type;
      powerup.active = true;
    };

    const spawnEnemy = (type, x, y) => {
      const baseHealth = {
        basic: 1,
        fast: 1,
        tank: 3,
        zigzag: 1
      };
      
      const baseSpeed = {
        basic: 1.5,
        fast: 3,
        tank: 0.8,
        zigzag: 1.8
      };

      const healthScaling = 1 + (game.level - 1) * 0.3;
      const speedScaling = 1 + (game.wave - 1) * 0.15;

      const enemy = {
        x,
        y,
        width: type === 'tank' ? 24 : 18,
        height: type === 'tank' ? 24 : 18,
        type,
        health: Math.ceil(baseHealth[type] * healthScaling),
        maxHealth: Math.ceil(baseHealth[type] * healthScaling),
        speed: baseSpeed[type] * speedScaling,
        vx: 0,
        vy: 0,
        time: 0,
        shootCooldown: Math.max(30 - game.level * 2, 10),
        active: true
      };

      game.enemies.push(enemy);
    };

    const spawnWave = () => {
      game.enemiesSpawned = 0;
      game.waveTimer = 0;
      
      const enemyCount = Math.min(3 + game.wave * 2, 12);
      const types = ['basic', 'basic', 'fast', 'tank', 'zigzag'];
      
      for (let i = 0; i < enemyCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (GAME_WIDTH - 40) + 20;
        spawnEnemy(type, x, -30);
      }
    };

    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    window.ninjaSpaceControls = {
      togglePause: () => togglePause(),
      restart: () => {
        game.gameOver = false;
        game.player.lives = 3;
        game.score = 0;
        game.wave = 1;
        game.level = 1;
        game.enemies = [];
        game.projectiles.forEach(p => p.active = false);
        game.explosions.forEach(e => e.active = false);
        game.powerups.forEach(p => p.active = false);
        game.player.x = GAME_WIDTH / 2;
        game.player.y = GAME_HEIGHT - 40;
        spawnWave();
      },
      toggleMute: () => {
        isMuted = !isMuted;
        return isMuted;
      }
    };

    spawnWave();

    const gameLoop = setInterval(() => {
      if (!game.paused) {
        // Player movement
        if (game.keys['arrowleft'] || game.keys['a']) {
          game.player.x = Math.max(10, game.player.x - game.player.speed);
        }
        if (game.keys['arrowright'] || game.keys['d']) {
          game.player.x = Math.min(GAME_WIDTH - 10, game.player.x + game.player.speed);
        }

        // Continuous shooting with spacebar or touch
        if (game.keys['space']) {
          shoot();
        }

        // Auto shoot cooldown
        if (game.shootCooldown > 0) {
          game.shootCooldown--;
        }

        // Power-ups expiration
        if (game.player.rapidFireTime > 0) {
          game.player.rapidFireTime--;
          game.player.rapidFire = true;
        } else {
          game.player.rapidFire = false;
        }

        if (game.player.multiShotTime > 0) {
          game.player.multiShotTime--;
          game.player.multiShot = true;
        } else {
          game.player.multiShot = false;
        }

        if (game.player.invulnerableTime > 0) {
          game.player.invulnerableTime--;
        } else {
          game.player.invulnerable = false;
        }

        // Update announcement timers
        if (game.levelUpTime > 0) {
          game.levelUpTime--;
        }
        if (game.waveUpTime > 0) {
          game.waveUpTime--;
        }

        // Update projectiles
        game.projectiles.forEach(p => {
          if (p.active) {
            p.y += p.vy;
            if (p.y < -10) p.active = false;
          }
        });

        // Spawn enemies continuously (endless) - BALANCED SPAWN RATE
        const maxEnemies = Math.min(4 + game.wave * 1.2, 12);
        if (game.enemies.filter(e => e.active).length < maxEnemies) {
          if (Math.random() < 0.12) {
            const types = ['basic', 'basic', 'basic', 'fast', 'fast', 'tank', 'zigzag'];
            const type = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * (GAME_WIDTH - 40) + 20;
            spawnEnemy(type, x, -30);
          }
        }

        // Update enemies
        game.enemies.forEach((enemy, eIdx) => {
          if (!enemy.active) return;

          enemy.time++;

          // Movement patterns
          if (enemy.type === 'basic') {
            enemy.vy = 1.5;
            enemy.vx = 0;
          } else if (enemy.type === 'fast') {
            enemy.vy = 3;
            enemy.vx = 0;
          } else if (enemy.type === 'tank') {
            enemy.vy = 0.7;
            enemy.vx = 0;
          } else if (enemy.type === 'zigzag') {
            enemy.vx = Math.sin(enemy.time * 0.05) * 2;
            enemy.vy = 1.8;
          }

          enemy.x += enemy.vx;
          enemy.y += enemy.vy;

          // Boundary wrap
          if (enemy.x < -20) enemy.x = GAME_WIDTH + 20;
          if (enemy.x > GAME_WIDTH + 20) enemy.x = -20;

          // Enemy shoots
          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0 && enemy.y > 0 && enemy.y < GAME_HEIGHT) {
            enemy.shootCooldown = Math.max(40 - game.level * 3, 20);
          }

          // Remove if too far down
          if (enemy.y > GAME_HEIGHT + 50) {
            enemy.active = false;
          }

          // Collision with projectiles
          game.projectiles.forEach((proj, pIdx) => {
            if (!proj.active) return;
            
            // Use bounding box for more reliable collision
            const projLeft = proj.x - proj.width / 2;
            const projRight = proj.x + proj.width / 2;
            const projTop = proj.y;
            const projBottom = proj.y + proj.height;
            
            const enemyLeft = enemy.x - enemy.width / 2;
            const enemyRight = enemy.x + enemy.width / 2;
            const enemyTop = enemy.y - enemy.height / 2;
            const enemyBottom = enemy.y + enemy.height / 2;
            
            // AABB collision detection
            if (projRight > enemyLeft && 
                projLeft < enemyRight && 
                projBottom > enemyTop && 
                projTop < enemyBottom) {
              proj.active = false;
              enemy.health--;
              sounds.hit();

              if (enemy.health <= 0) {
                createExplosion(enemy.x, enemy.y, 30);
                sounds.explosion();
                game.score += enemy.type === 'tank' ? 50 : enemy.type === 'fast' ? 30 : 20;
                game.enemiesKilled++;
                enemy.active = false;

                // Chance to drop powerup
                if (Math.random() < 0.15) {
                  const types = ['rapidfire', 'multishot'];
                  createPowerup(enemy.x, enemy.y, types[Math.floor(Math.random() * types.length)]);
                }

                // Level up every 10 enemies
                if (game.enemiesKilled % 10 === 0) {
                  game.level++;
                  game.levelUpTime = 120;
                }

                // Wave up every 20 enemies
                if (game.enemiesKilled % 20 === 0) {
                  game.wave++;
                  game.waveUpTime = 120;
                }
              }
            }
          });
        });

        // Update powerups
        game.powerups.forEach(p => {
          if (p.active) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03;

            if (
              p.x < game.player.x + 25 &&
              p.x + p.width > game.player.x - 25 &&
              p.y < game.player.y + 25 &&
              p.y + p.height > game.player.y - 25
            ) {
              sounds.powerup();
              if (p.type === 'rapidfire') {
                game.player.rapidFireTime = 300;
              } else if (p.type === 'multishot') {
                game.player.multiShotTime = 300;
              }
              p.active = false;
            }

            if (p.y > GAME_HEIGHT + 50) {
              p.active = false;
            }
          }
        });

        // Update explosions
        game.explosions.forEach(e => {
          if (e.active) {
            e.life--;
            if (e.life <= 0) e.active = false;
          }
        });

        // Player collision with enemies
        if (!game.gameOver) {
          game.enemies.forEach(enemy => {
            if (!enemy.active) return;
            if (
              !game.player.invulnerable &&
              game.player.x < enemy.x + enemy.width &&
              game.player.x + game.player.width > enemy.x &&
              game.player.y < enemy.y + enemy.height &&
              game.player.y + game.player.height > enemy.y
            ) {
              game.player.lives--;
              game.player.invulnerable = true;
              game.player.invulnerableTime = 120;
              createExplosion(game.player.x, game.player.y, 40);
              sounds.explosion();
              enemy.active = false;

              if (game.player.lives <= 0) {
                game.gameOver = true;
                sounds.gameOver();
                setCurrentScore(game.score);
                if (window.storage && game.score > highScore) {
                  window.storage.set('ninjaspace_highscore', game.score.toString()).catch(() => {});
                  setHighScore(game.score);
                }
              }
            }
          });
        }
      }

      // Rendering
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw grid background
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < GAME_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < GAME_HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_WIDTH, i);
        ctx.stroke();
      }

      // Draw projectiles
      ctx.fillStyle = '#0ff';
      game.projectiles.forEach(p => {
        if (p.active) {
          ctx.fillRect(p.x - p.width / 2, p.y, p.width, p.height);
        }
      });

      // Draw explosions
      game.explosions.forEach(e => {
        if (e.active) {
          const progress = 1 - e.life / e.maxLife;
          ctx.fillStyle = `rgba(255, 165, 0, ${1 - progress})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * (1 + progress * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw enemies
      game.enemies.forEach(enemy => {
        if (!enemy.active) return;
        const hpPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = enemy.type === 'tank' ? '#ff6600' : enemy.type === 'fast' ? '#ff00ff' : enemy.type === 'zigzag' ? '#ffff00' : '#ff0000';
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);

        // HP bar
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2 - 8, enemy.width * hpPercent, 4);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2 - 8, enemy.width, 4);
      });

      // Draw powerups - Enemy style highlight
      game.powerups.forEach(p => {
        if (p.active) {
          // Powerup body color based on type
          if (p.type === 'rapidfire') {
            ctx.fillStyle = '#ff0000';
          } else if (p.type === 'multishot') {
            ctx.fillStyle = '#ffff00';
          }
          
          // Draw as enemy-like box
          ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
          
          // Add colored border like enemy
          if (p.type === 'rapidfire') {
            ctx.strokeStyle = '#ff6666';
          } else if (p.type === 'multishot') {
            ctx.strokeStyle = '#ffff66';
          }
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
          
          // Add shine effect
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(p.x - p.width / 2 + 1, p.y - p.height / 2 + 1, p.width - 2, 2);
        }
      });

      // Draw player (Ninja style)
      const playerColor = game.player.invulnerable && Math.floor(game.time / 5) % 2 ? 'rgba(0, 255, 255, 0.5)' : '#0ff';
      
      // Ninja body
      ctx.fillStyle = playerColor;
      ctx.beginPath();
      ctx.moveTo(game.player.x, game.player.y - 10); // Head top
      ctx.lineTo(game.player.x - 8, game.player.y); // Left shoulder
      ctx.lineTo(game.player.x - 6, game.player.y + 8); // Left arm
      ctx.lineTo(game.player.x - 8, game.player.y + 5); // Body
      ctx.lineTo(game.player.x - 6, game.player.y + 12); // Left leg
      ctx.lineTo(game.player.x - 2, game.player.y + 10); // Left foot
      ctx.lineTo(game.player.x + 2, game.player.y + 10); // Right foot
      ctx.lineTo(game.player.x + 6, game.player.y + 12); // Right leg
      ctx.lineTo(game.player.x + 8, game.player.y + 5); // Body
      ctx.lineTo(game.player.x + 6, game.player.y + 8); // Right arm
      ctx.lineTo(game.player.x + 8, game.player.y); // Right shoulder
      ctx.closePath();
      ctx.fill();

      // Ninja mask/eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(game.player.x - 3, game.player.y - 6, 2, 2);
      ctx.fillRect(game.player.x + 1, game.player.y - 6, 2, 2);

      // Ninja sword
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(game.player.x + 8, game.player.y - 2);
      ctx.lineTo(game.player.x + 14, game.player.y - 10);
      ctx.stroke();

      // Player indicators
      if (game.player.rapidFire) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(game.player.x - 15, game.player.y - 15, 30, 30);
      }
      if (game.player.multiShot) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.strokeRect(game.player.x - 18 + i * 6, game.player.y - 18 + i * 6, 36 - i * 12, 36 - i * 12);
        }
      }

      // UI Text
      ctx.fillStyle = '#0ff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`SCORE: ${game.score}`, 10, 25);
      ctx.fillText(`LEVEL: ${game.level}`, 10, 50);
      ctx.fillText(`WAVE: ${game.wave}`, 10, 75);
      ctx.fillText(`LIVES: ${game.player.lives}`, 10, 100);
      ctx.fillText(`ENEMIES: ${game.enemies.filter(e => e.active).length}`, GAME_WIDTH - 200, 25);
      ctx.fillText(`HIGH: ${highScore}`, GAME_WIDTH - 200, 50);

      if (game.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.textAlign = 'left';
      }

      // Level Up Announcement
      if (game.levelUpTime > 0) {
        const alpha = Math.min(1, game.levelUpTime / 30);
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.8})`;
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillText(`LEVEL ${game.level}`, GAME_WIDTH / 2, 150);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      }

      // Wave Up Announcement
      if (game.waveUpTime > 0) {
        const alpha = Math.min(1, game.waveUpTime / 30);
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.8})`;
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillText(`WAVE ${game.wave}`, GAME_WIDTH / 2, 250);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      }

      if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`Final Score: ${game.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        ctx.fillText(`Level Reached: ${game.level}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
        ctx.textAlign = 'left';
      }

      game.time++;
    }, FRAME_TIME);

    return () => {
      clearInterval(gameLoop);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [highScore]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        style={{
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
          border: '3px solid #0ff',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1)',
          display: 'block'
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '0 20px',
          zIndex: 10
        }}
      >
        <button
          onClick={() => window.ninjaSpaceControls?.togglePause()}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            backgroundColor: '#1a1a1a',
            color: '#0ff',
            border: '2px solid #0ff',
            borderRadius: '4px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            minWidth: '100px'
          }}
          onMouseEnter={e => (e.target.style.backgroundColor = '#0a0a0a')}
          onMouseLeave={e => (e.target.style.backgroundColor = '#1a1a1a')}
        >
          ⏸ PAUSE
        </button>

        <button
          onClick={() => window.ninjaSpaceControls?.restart()}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            backgroundColor: '#2a0a0a',
            color: '#ff3333',
            border: '2px solid #ff3333',
            borderRadius: '4px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            minWidth: '100px'
          }}
          onMouseEnter={e => (e.target.style.backgroundColor = '#3a0a0a')}
          onMouseLeave={e => (e.target.style.backgroundColor = '#2a0a0a')}
        >
          🔄 RESTART
        </button>

        <button
          onClick={e => {
            const muted = window.ninjaSpaceControls?.toggleMute();
            e.target.textContent = muted ? '🔇 MUTED' : '🔊 SOUND';
          }}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            backgroundColor: '#0a2a0a',
            color: '#00ff00',
            border: '2px solid #00ff00',
            borderRadius: '4px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            minWidth: '100px'
          }}
          onMouseEnter={e => (e.target.style.backgroundColor = '#0a3a0a')}
          onMouseLeave={e => (e.target.style.backgroundColor = '#0a2a0a')}
        >
          🔊 SOUND
        </button>
      </div>

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        color: '#0ff',
        fontFamily: 'monospace',
        fontSize: '14px',
        textAlign: 'right'
      }}>
        <div>🎮 NINJA SPACE</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>↑↓←→ Move | SPACE Shoot</div>
      </div>
    </div>
  );
}

export default NinjaSpaceGame;