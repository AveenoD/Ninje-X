import React, { useEffect, useRef, useState } from 'react';

const NinjaRunGame = () => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [health, setHealth] = useState(3);
  const [distance, setDistance] = useState(0);

  // Load high score on mount
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const result = await window.storage.get('ninja-run-highscore');
        if (result && result.value) {
          setHighScore(parseInt(result.value));
        }
      } catch (error) {
        console.log('No high score found yet');
      }
    };
    loadHighScore();
  }, []);

  // Save high score when it changes
  const saveHighScore = async (newHighScore) => {
    try {
      await window.storage.set('ninja-run-highscore', newHighScore.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  };

  useEffect(() => {
    if (!gameStarted || !gameRef.current) return;

    const loadPhaser = () => {
      return new Promise((resolve, reject) => {
        if (window.Phaser) {
          resolve(window.Phaser);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
        script.onload = () => resolve(window.Phaser);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadPhaser().then((Phaser) => {
      let player;
      let cursors;
      let platforms;
      let enemies;
      let coins;
      let powerUps;
      let scoreValue = 0;
      let distanceValue = 0;
      let canAttack = true;
      let playerHealth = 3;
      let isInvincible = false;
      let mountains;
      let xKey;
      let scoreText;
      let healthText;
      let distanceText;
      let difficultyLevel = 1;
      let hasDoubleJump = false;
      let comboCounter = 0;
      let comboText;
      let activeTweens = [];

      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 400,
        parent: gameRef.current,
        backgroundColor: '#87CEEB',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 800,
          height: 400
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 800 },
            debug: false
          }
        },
        scene: {
          preload: preload,
          create: create,
          update: update
        }
      };

      phaserGameRef.current = new Phaser.Game(config);

      function preload() {
        createGradientTexture(this, 'sky', 800, 400, '#87CEEB', '#E0F6FF');
        createMountainTexture(this, 'mountains', 800, 200);
        createGroundTexture(this, 'ground', 400, 32);
        createPlatformTexture(this, 'platform', 200, 20);
        createNinjaTexture(this, 'ninja', 32, 48);
        createEnemyTexture(this, 'enemy', 32, 32);
        createFastEnemyTexture(this, 'fastEnemy', 32, 32);
        createCoinTexture(this, 'coin', 20, 20);
        createSwordTexture(this, 'sword', 30, 8);
        createHeartTexture(this, 'heart', 20, 20);
        createStarTexture(this, 'star', 24, 24);
      }

      function create() {
        this.add.tileSprite(400, 200, 800, 400, 'sky').setScrollFactor(0);
        mountains = this.add.tileSprite(400, 250, 800, 200, 'mountains').setScrollFactor(0.3);

        platforms = this.physics.add.staticGroup();

        for (let i = 0; i < 15; i++) {
          platforms.create(i * 400 + 200, 384, 'ground').setScale(1).refreshBody();
        }

        player = this.physics.add.sprite(100, 300, 'ninja');
        player.setBounce(0.1);
        player.setCollideWorldBounds(false);
        player.body.setSize(24, 44);
        player.body.setOffset(4, 4);
        player.furthestX = 0;
        player.jumpsLeft = 1;

        player.sword = this.add.sprite(0, 0, 'sword');
        player.sword.setVisible(false);

        this.physics.add.collider(player, platforms);

        enemies = this.physics.add.group();
        coins = this.physics.add.group();
        powerUps = this.physics.add.group();

        this.physics.add.overlap(player, coins, collectCoin, null, this);
        this.physics.add.overlap(player, powerUps, collectPowerUp, null, this);
        this.physics.add.overlap(player, enemies, hitEnemy, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // Cheat codes setup
        const scene = this;
        
        this.input.keyboard.on('keydown-H', function() {
          playerHealth = 3;
          updateHealth();
          showCheatText(scene, '❤️ FULL HEALTH!');
        });
        
        this.input.keyboard.on('keydown-I', function() {
          if (!isInvincible) {
            isInvincible = true;
            player.setTint(0x00ffff);
            showCheatText(scene, '🛡️ INVINCIBLE!');
            scene.time.delayedCall(10000, function() {
              isInvincible = false;
              if (player && player.active) {
                player.clearTint();
              }
            });
          }
        });
        
        this.input.keyboard.on('keydown-S', function() {
          if (player && player.active) {
            player.setVelocityX(player.flipX ? -400 : 400);
            showCheatText(scene, '⚡ SPEED BOOST!');
          }
        });
        
        this.input.keyboard.on('keydown-D', function() {
          hasDoubleJump = true;
          showCheatText(scene, '⭐ DOUBLE JUMP!');
        });

        this.cameras.main.startFollow(player, true, 0.1, 0.1);
        // Use large finite bounds to avoid engine edge-cases with Infinity
        const WORLD_WIDTH = 1000000;
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 400);
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, 400);

        // HUD background panel to prevent overlap with game content
        const hudBg = this.add.rectangle(170, 66, 300, 90, 0x000000, 0.35)
          .setOrigin(0, 0).setScrollFactor(0).setDepth(90);

        // UI Elements with proper spacing - no overlap
        scoreText = this.add.text(20, 20, 'Score: 0', { 
          fontSize: '22px', 
          fill: '#fff',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        healthText = this.add.text(20, 56, '❤️ ❤️ ❤️', { 
          fontSize: '24px', 
          fill: '#fff'
        }).setScrollFactor(0).setDepth(100);

        distanceText = this.add.text(20, 92, 'Distance: 0m', { 
          fontSize: '20px', 
          fill: '#fff',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 3
        }).setScrollFactor(0).setDepth(100);

        comboText = this.add.text(400, 140, '', { 
          fontSize: '32px', 
          fill: '#FFD700',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 5
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5);
      }

      function update() {
        if (!player || !player.active) return;

        if (player.y > 450) {
          gameOverHandler(this);
          return;
        }

        distanceValue = Math.floor(player.x / 10);
        distanceText.setText(`Distance: ${distanceValue}m`);
        setDistance(distanceValue);

        const newDifficulty = Math.floor(distanceValue / 500) + 1;
        if (newDifficulty > difficultyLevel) {
          difficultyLevel = newDifficulty;
        }

        const generationDistance = 200;
        if (player.x > player.furthestX + generationDistance) {
          player.furthestX = player.x;
          
          const lastGroundX = player.x + 1200;
          const groundTile = platforms.create(lastGroundX, 384, 'ground');
          groundTile.setScale(1).refreshBody();
          
          if (Phaser.Math.Between(0, 100) < 40) {
            const platformX = player.x + Phaser.Math.Between(600, 1000);
            const platformY = Phaser.Math.Between(240, 320);
            const platform = platforms.create(platformX, platformY, 'platform');
            platform.refreshBody();
            
            if (Phaser.Math.Between(0, 100) < 70) {
              const coin = coins.create(platformX, platformY - 40, 'coin');
              coin.setBounce(0.3);
              this.physics.add.collider(coin, platforms);
            }
          }

          if (Phaser.Math.Between(0, 100) < 25) {
            const coinX = player.x + Phaser.Math.Between(600, 1000);
            const coin = coins.create(coinX, 340, 'coin');
            coin.setBounce(0.3);
            this.physics.add.collider(coin, platforms);
          }
          
          const enemyChance = Math.min(15 + difficultyLevel * 2, 30);
          if (Phaser.Math.Between(0, 100) < enemyChance) {
            const enemyX = player.x + Phaser.Math.Between(700, 1100);
            const isFast = difficultyLevel > 2 && Phaser.Math.Between(0, 100) < 30;
            const enemyType = isFast ? 'fastEnemy' : 'enemy';
            const enemy = enemies.create(enemyX, 250, enemyType);
            enemy.setBounce(0.1);
            enemy.setCollideWorldBounds(false);
            const speed = isFast ? -120 : -70;
            enemy.body.setVelocityX(speed);
            enemy.minX = enemyX - 100;
            enemy.maxX = enemyX + 100;
            enemy.baseSpeed = speed;
            enemy.isFast = isFast;
            this.physics.add.collider(enemy, platforms);
          }

          if (Phaser.Math.Between(0, 100) < 8) {
            const powerUpX = player.x + Phaser.Math.Between(700, 1000);
            const powerUpType = Phaser.Math.Between(0, 100) < 50 ? 'heart' : 'star';
            const powerUp = powerUps.create(powerUpX, 280, powerUpType);
            powerUp.powerType = powerUpType;
            powerUp.setBounce(0);
            powerUp.body.setAllowGravity(false);
            powerUp.body.setImmovable(true);
            powerUp.startY = 280;
            
            // Store tween reference on the powerup object itself
            powerUp.floatTween = this.tweens.add({
              targets: powerUp,
              y: 260,
              duration: 1500,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }

        const cleanupDistance = 1200;
        
        platforms.children.entries.forEach(platform => {
          if (platform.x < player.x - cleanupDistance && platform.y !== 384) {
            platform.destroy();
          }
        });
        
        enemies.children.entries.forEach(enemy => {
          if (enemy.x < player.x - cleanupDistance) {
            enemy.destroy();
          }
        });
        
        coins.children.entries.forEach(coin => {
          if (coin.x < player.x - cleanupDistance) {
            coin.destroy();
          }
        });

        powerUps.children.entries.forEach(powerUp => {
          if (powerUp.x < player.x - cleanupDistance) {
            if (powerUp.floatTween) {
              powerUp.floatTween.remove();
            }
            powerUp.destroy();
          }
        });

        if (cursors.left.isDown) {
          player.setVelocityX(-200);
          player.flipX = true;
        } else if (cursors.right.isDown) {
          player.setVelocityX(200);
          player.flipX = false;
        } else {
          player.setVelocityX(0);
        }

        if (player.body.touching.down) {
          player.jumpsLeft = hasDoubleJump ? 2 : 1;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) && player.jumpsLeft > 0) {
          player.setVelocityY(-400);
          player.jumpsLeft--;
        }

        if (Phaser.Input.Keyboard.JustDown(xKey) && canAttack) {
          attackWithSword(this);
        }

        if (player.sword) {
          const swordOffset = player.flipX ? -25 : 25;
          player.sword.setPosition(player.x + swordOffset, player.y);
          player.sword.flipX = player.flipX;
        }

        enemies.children.entries.forEach(enemy => {
          if (!enemy.active || !enemy.body) return;
          
          const currentVelX = enemy.body.velocity.x;
          const speed = Math.abs(enemy.baseSpeed || 70);
          
          if (enemy.x <= enemy.minX && currentVelX < 0) {
            enemy.body.setVelocityX(speed);
          } else if (enemy.x >= enemy.maxX && currentVelX > 0) {
            enemy.body.setVelocityX(-speed);
          }
        });

        if (mountains) {
          mountains.tilePositionX = this.cameras.main.scrollX * 0.3;
        }
      }

      function attackWithSword(scene) {
        if (!canAttack || !player.sword) return;

        canAttack = false;
        player.sword.setVisible(true);

        let enemiesHit = 0;

        enemies.children.entries.forEach(enemy => {
          if (!enemy.active) return;
          
          // Check if enemy is close enough to hit
          const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
          
          // More generous hit detection - check if in front of player and within range
          const isInFront = player.flipX ? enemy.x < player.x : enemy.x > player.x;
          const horizontalDistance = Math.abs(enemy.x - player.x);
          const verticalDistance = Math.abs(enemy.y - player.y);
          
          if (isInFront && horizontalDistance < 60 && verticalDistance < 40) {
            createParticleExplosion(scene, enemy.x, enemy.y, enemy.isFast ? '#FF00FF' : '#FF0000');
            
            enemy.destroy();
            const points = enemy.isFast ? 75 : 50;
            scoreValue += points;
            enemiesHit++;
            
            comboCounter++;
            if (comboCounter > 1) {
              const bonusPoints = comboCounter * 10;
              scoreValue += bonusPoints;
              showComboText(scene, comboCounter);
            }
            
            updateScore();
          }
        });

        if (enemiesHit === 0) {
          comboCounter = 0;
        }

        scene.time.delayedCall(300, () => {
          if (player.sword) player.sword.setVisible(false);
          canAttack = true;
        });
      }

      function collectCoin(playerObj, coin) {
        createParticleExplosion(coin.scene, coin.x, coin.y, '#FFD700');
        coin.destroy();
        scoreValue += 10;
        updateScore();
      }

      function collectPowerUp(playerObj, powerUp) {
        createParticleExplosion(powerUp.scene, powerUp.x, powerUp.y, '#00FF00');
        
        // Stop the floating animation
        if (powerUp.floatTween) {
          powerUp.floatTween.remove();
        }
        
        if (powerUp.powerType === 'heart') {
          if (playerHealth < 3) {
            playerHealth++;
            updateHealth();
          }
        } else if (powerUp.powerType === 'star') {
          hasDoubleJump = true;
          showPowerUpText(powerUp.scene, 'Double Jump!');
          
          powerUp.scene.time.delayedCall(10000, () => {
            hasDoubleJump = false;
          });
        }
        
        powerUp.destroy();
      }

      function hitEnemy(playerObj, enemy) {
        if (!playerObj.active || isInvincible) return;
        
        playerHealth--;
        comboCounter = 0;
        updateHealth();
        
        const knockbackX = playerObj.x < enemy.x ? -200 : 200;
        playerObj.setVelocity(knockbackX, -200);

        isInvincible = true;
        
        const scene = playerObj.scene;
        let flashCount = 0;
        const flashInterval = scene.time.addEvent({
          delay: 100,
          callback: () => {
            playerObj.alpha = playerObj.alpha === 1 ? 0.3 : 1;
            flashCount++;
            if (flashCount >= 10) {
              flashInterval.remove();
              playerObj.alpha = 1;
              isInvincible = false;
            }
          },
          loop: true
        });

        if (playerHealth <= 0) {
          gameOverHandler(scene);
        }
      }

      function createParticleExplosion(scene, x, y, color) {
        const particles = scene.add.particles(x, y, 'coin', {
          speed: { min: 50, max: 150 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.5, end: 0 },
          lifespan: 500,
          tint: Phaser.Display.Color.HexStringToColor(color).color,
          quantity: 8
        });
        
        scene.time.delayedCall(600, () => particles.destroy());
      }

      function showComboText(scene, combo) {
        comboText.setText(`${combo}x COMBO!`);
        comboText.setAlpha(1);
        
        scene.tweens.add({
          targets: comboText,
          alpha: 0,
          duration: 1000,
          ease: 'Power2'
        });
      }

      function showPowerUpText(scene, text) {
        const powerUpText = scene.add.text(400, 100, text, {
          fontSize: '32px',
          fill: '#00FF00',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 5
        }).setScrollFactor(0).setOrigin(0.5).setDepth(100);

        scene.tweens.add({
          targets: powerUpText,
          y: 50,
          alpha: 0,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => powerUpText.destroy()
        });
      }
      
      function showCheatText(scene, text) {
        // Cheat text disabled - no visual feedback
        return;
      }

      async function gameOverHandler(scene) {
        if (scoreValue > highScore) {
          setHighScore(scoreValue);
          await saveHighScore(scoreValue);
        }
        setGameOver(true);
        scene.physics.pause();
        if (player && player.active) {
          player.setTint(0xff0000);
        }
      }

      function updateScore() {
        setScore(scoreValue);
        scoreText.setText(`Score: ${scoreValue}`);
      }

      function updateHealth() {
        setHealth(playerHealth);
        const hearts = '❤️ '.repeat(Math.max(0, playerHealth));
        const emptyHearts = '🖤 '.repeat(Math.max(0, 3 - playerHealth));
        healthText.setText(hearts + emptyHearts);
      }

      function createGradientTexture(scene, key, width, height, color1, color2) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        canvas.refresh();
      }

      function createMountainTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width * 0.2, height * 0.3);
        ctx.lineTo(width * 0.4, height * 0.6);
        ctx.lineTo(width * 0.6, height * 0.2);
        ctx.lineTo(width * 0.8, height * 0.5);
        ctx.lineTo(width, height * 0.4);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        canvas.refresh();
      }

      function createGroundTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 10; i++) {
          ctx.fillRect(Math.random() * width, Math.random() * height, 3, 3);
        }
        canvas.refresh();
      }

      function createPlatformTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
        canvas.refresh();
      }

      function createNinjaTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(8, 20, 18, 28);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(10, 38, 5, 10);
        ctx.fillRect(17, 38, 5, 10);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(10, 40, 5, 1);
        ctx.fillRect(17, 40, 5, 1);
        ctx.fillRect(10, 43, 5, 1);
        ctx.fillRect(17, 43, 5, 1);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(9, 20, 14, 18);
        
        ctx.fillStyle = '#16213e';
        ctx.fillRect(10, 22, 12, 14);
        
        ctx.fillStyle = '#c1121f';
        ctx.fillRect(11, 24, 10, 2);
        ctx.fillRect(12, 28, 8, 1);
        ctx.fillRect(13, 32, 6, 1);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(9, 35, 14, 3);
        ctx.fillStyle = '#654321';
        ctx.fillRect(14, 35, 4, 3);
        
        ctx.fillStyle = '#16213e';
        ctx.fillRect(6, 22, 3, 14);
        ctx.fillRect(23, 22, 3, 14);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(6, 26, 3, 1);
        ctx.fillRect(23, 26, 3, 1);
        ctx.fillRect(6, 30, 3, 1);
        ctx.fillRect(23, 30, 3, 1);
        
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(5, 34, 3, 3);
        ctx.fillRect(24, 34, 3, 3);
        
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(11, 6, 10, 14);
        
        ctx.fillStyle = '#c1121f';
        ctx.fillRect(10, 5, 12, 4);
        
        ctx.fillStyle = '#778da9';
        ctx.fillRect(13, 6, 6, 2);
        
        ctx.fillStyle = '#9a031e';
        ctx.fillRect(22, 6, 3, 2);
        ctx.fillRect(24, 6, 2, 1);
        
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(11, 12, 10, 8);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(11, 12, 10, 1);
        
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(12, 14, 3, 3);
        ctx.fillRect(17, 14, 3, 3);
        
        ctx.fillStyle = '#7fff00';
        ctx.fillRect(13, 15, 2, 2);
        ctx.fillRect(18, 15, 2, 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 15, 1, 1);
        ctx.fillRect(18, 15, 1, 1);
        
        ctx.fillStyle = '#16213e';
        ctx.fillRect(7, 20, 3, 3);
        ctx.fillRect(22, 20, 3, 3);
        
        ctx.fillStyle = '#c1121f';
        ctx.fillRect(7, 20, 1, 2);
        ctx.fillRect(24, 20, 1, 2);
        
        canvas.refresh();
      }

      function createEnemyTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(4, 4, 24, 24);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(5, 5, 22, 22);
        
        ctx.fillStyle = '#660000';
        ctx.fillRect(6, 7, 20, 3);
        ctx.fillRect(6, 11, 20, 3);
        ctx.fillRect(6, 15, 20, 3);
        
        ctx.fillStyle = '#990000';
        ctx.fillRect(7, 7, 18, 1);
        ctx.fillRect(7, 11, 18, 1);
        ctx.fillRect(7, 15, 18, 1);
        
        ctx.fillStyle = '#4a0000';
        ctx.fillRect(5, 5, 3, 5);
        ctx.fillRect(24, 5, 3, 5);
        ctx.fillStyle = '#330000';
        ctx.fillRect(5, 5, 3, 2);
        ctx.fillRect(24, 5, 3, 2);
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(8, 12, 6, 5);
        ctx.fillRect(18, 12, 6, 5);
        
        ctx.fillStyle = '#FF3333';
        ctx.fillRect(9, 13, 4, 3);
        ctx.fillRect(19, 13, 4, 3);
        
        ctx.fillStyle = '#FF6666';
        ctx.fillRect(10, 14, 2, 2);
        ctx.fillRect(20, 14, 2, 2);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 19, 12, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(11, 20, 2, 3);
        ctx.fillRect(14, 20, 2, 3);
        ctx.fillRect(19, 20, 2, 3);
        
        ctx.fillStyle = '#330000';
        ctx.fillRect(3, 10, 3, 6);
        ctx.fillRect(26, 10, 3, 6);
        
        ctx.fillStyle = '#220000';
        ctx.fillRect(2, 11, 2, 2);
        ctx.fillRect(28, 11, 2, 2);
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(14, 13, 4, 4);
        
        canvas.refresh();
      }

      function createFastEnemyTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(4, 4, 24, 24);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#8B00FF';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 12, 6, 2);
        ctx.fillRect(0, 15, 5, 2);
        ctx.fillRect(0, 18, 4, 2);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#4B0082';
        ctx.fillRect(5, 5, 22, 22);
        
        ctx.fillStyle = '#6A0DAD';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(3, 8, 2, 16);
        ctx.fillRect(27, 8, 2, 16);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#2D0052';
        ctx.fillRect(6, 5, 20, 9);
        ctx.fillStyle = '#1a0033';
        ctx.fillRect(7, 6, 18, 7);
        
        ctx.fillStyle = '#0a001a';
        ctx.fillRect(8, 9, 16, 11);
        
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(8, 13, 6, 4);
        ctx.fillRect(18, 13, 6, 4);
        
        ctx.fillStyle = '#FF33FF';
        ctx.fillRect(9, 14, 4, 2);
        ctx.fillRect(19, 14, 4, 2);
        
        ctx.fillStyle = '#FF99FF';
        ctx.fillRect(10, 14, 2, 2);
        ctx.fillRect(20, 14, 2, 2);
        
        ctx.fillStyle = '#9D00FF';
        ctx.fillRect(5, 10, 1, 12);
        ctx.fillRect(26, 10, 1, 12);
        
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(8, 20, 16, 3);
        ctx.fillStyle = '#FF66FF';
        ctx.fillRect(9, 21, 14, 1);
        
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(15, 16, 2, 2);
        ctx.fillRect(14, 17, 1, 1);
        ctx.fillRect(17, 17, 1, 1);
        
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(6, 8, 1, 1);
        ctx.fillRect(25, 10, 1, 1);
        ctx.fillRect(7, 23, 1, 1);
        ctx.fillRect(24, 22, 1, 1);
        
        canvas.refresh();
      }

      function createCoinTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        
        ctx.fillStyle = '#B8860B';
        ctx.beginPath();
        ctx.arc(width / 2 + 1, height / 2 + 1, width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.strokeStyle = '#FFED4E';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#FFFACD';
        ctx.beginPath();
        ctx.arc(width / 2 - 3, height / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        canvas.refresh();
      }

      function createSwordTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        
        ctx.fillStyle = '#808080';
        ctx.fillRect(1, 3, 24, 3);
        
        ctx.fillStyle = '#E8E8E8';
        ctx.fillRect(0, 2, 24, 4);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 2, 24, 1);
        
        ctx.fillStyle = '#B0B0B0';
        ctx.fillRect(2, 4, 20, 1);
        
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(20, 0, 3, 8);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(23, 1, 6, 6);
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(23, 2, 6, 1);
        ctx.fillRect(23, 4, 6, 1);
        ctx.fillRect(23, 6, 6, 1);
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(29, 2, 1, 4);
        
        canvas.refresh();
      }

      function createHeartTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        
        ctx.fillStyle = '#8B0A50';
        ctx.beginPath();
        ctx.moveTo(width / 2 + 1, height * 0.3 + 1);
        ctx.bezierCurveTo(width / 2 + 1, height * 0.15 + 1, width * 0.2 + 1, 1, width * 0.2 + 1, height * 0.3 + 1);
        ctx.bezierCurveTo(width * 0.2 + 1, height * 0.5 + 1, width / 2 + 1, height * 0.7 + 1, width / 2 + 1, height + 1);
        ctx.bezierCurveTo(width / 2 + 1, height * 0.7 + 1, width * 0.8 + 1, height * 0.5 + 1, width * 0.8 + 1, height * 0.3 + 1);
        ctx.bezierCurveTo(width * 0.8 + 1, 1, width / 2 + 1, height * 0.15 + 1, width / 2 + 1, height * 0.3 + 1);
        ctx.fill();
        
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.moveTo(width / 2, height * 0.3);
        ctx.bezierCurveTo(width / 2, height * 0.15, width * 0.2, 0, width * 0.2, height * 0.3);
        ctx.bezierCurveTo(width * 0.2, height * 0.5, width / 2, height * 0.7, width / 2, height);
        ctx.bezierCurveTo(width / 2, height * 0.7, width * 0.8, height * 0.5, width * 0.8, height * 0.3);
        ctx.bezierCurveTo(width * 0.8, 0, width / 2, height * 0.15, width / 2, height * 0.3);
        ctx.fill();
        
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(width * 0.35, height * 0.25, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(width * 0.42, height * 0.32, 2, 0, Math.PI * 2);
        ctx.fill();
        
        canvas.refresh();
      }

      function createStarTexture(scene, key, width, height) {
        const canvas = scene.textures.createCanvas(key, width, height);
        const ctx = canvas.context;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        const centerX = width / 2;
        const centerY = height / 2;
        const spikes = 5;
        const outerRadius = width / 2;
        const innerRadius = width / 4;
        
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        canvas.refresh();
      }
    }).catch(err => {
      console.error('Failed to load Phaser:', err);
    });

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [gameStarted]);

  const handleQuickPlay = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
    setHealth(3);
    setDistance(0);
  };

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setHealth(3);
    setDistance(0);
    
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }
    setGameStarted(false);
    setTimeout(() => {
      setGameStarted(true);
    }, 150);
  };

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(to bottom,#2d3748,#1f2937)', padding:'16px', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#1f2937', borderRadius:'12px', boxShadow:'0 20px 40px rgba(0,0,0,0.4)', padding:'24px', width:'100%', maxWidth:'1000px'}}>
        <h1 style={{fontSize:'32px', fontWeight:800, textAlign:'center', marginBottom:'16px', color:'#fff'}}>
          ⚔ Ninja Run
        </h1>
        
        {!gameStarted ? (
          <div style={{textAlign:'center'}}>
            <div style={{background:'#374151', borderRadius:'12px', padding:'24px', marginBottom:'16px', color:'#e5e7eb'}}>
              <h2 style={{fontSize:'22px', fontWeight:800, color:'#fff', marginBottom:'12px'}}>How to Play</h2>
              <div style={{textAlign:'left', marginBottom:'12px'}}>
                <p>⬅️ ➡️ <strong>Arrow Keys</strong> - Move left/right</p>
                <p>⬆️ <strong>Up Arrow</strong> - Jump (double jump with star power-up!)</p>
                <p>❌ <strong>X Key</strong> - Attack with sword</p>
                <p>💰 <strong>Coins</strong> - +10 points each</p>
                <p>⚔️ <strong>Red Enemies</strong> - +50 points when defeated</p>
                <p>💜 <strong>Purple Enemies</strong> - Fast enemies worth +75 points</p>
                <p>❤️ <strong>Heart Power-Up</strong> - Restore 1 health</p>
                <p>⭐ <strong>Star Power-Up</strong> - Temporary double jump ability</p>
                <p>🔥 <strong>Combo System</strong> - Chain enemy defeats for bonus points!</p>
                <p style={{color:'#facc15', marginTop:'8px'}}>⚠️ You have 3 lives. Don't fall off!</p>
              </div>
              {highScore > 0 && (
                <div style={{marginTop:'8px', padding:'8px', background:'#ca8a04', borderRadius:'8px'}}>
                  <p style={{color:'#fff', fontWeight:800, fontSize:'18px'}}>🏆 High Score: {highScore}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleQuickPlay}
              style={{background:'#dc2626', color:'#fff', fontWeight:800, padding:'14px 24px', borderRadius:'10px', fontSize:'18px', cursor:'pointer', border:'none'}}
            >
              🎮 Quick Play
            </button>
          </div>
        ) : (
          <>
            <div style={{background:'#374151', borderRadius:'12px', padding:'12px', marginBottom:'16px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                <div style={{display:'flex', gap:'24px', alignItems:'center', color:'#fff', fontWeight:800}}>
                  <div style={{fontSize:'18px'}}>
                    💰 Score: {score}
                  </div>
                  <div style={{fontSize:'18px'}}>
                    📏 {distance}m
                  </div>
                  <div style={{fontSize:'18px'}}>
                    {health === 3 && '❤️ ❤️ ❤️'}
                    {health === 2 && '❤️ ❤️ 🖤'}
                    {health === 1 && '❤️ 🖤 🖤'}
                    {health === 0 && '🖤 🖤 🖤'}
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  style={{background:'#2563eb', color:'#fff', fontWeight:800, padding:'8px 16px', borderRadius:'8px', cursor:'pointer', border:'none'}}
                >
                  🔄 Restart
                </button>
              </div>
            </div>
            
            <div 
              ref={gameRef}
              style={{ width: '100%', maxWidth: '800px', aspectRatio: '2 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', border:'4px solid #4b5563', borderRadius:'12px', overflow:'hidden', margin:'0 auto', boxShadow:'0 20px 40px rgba(0,0,0,0.35)' }}
            />
            
            {gameOver && (
              <div style={{marginTop:'16px', background:'#dc2626', borderRadius:'12px', padding:'24px', textAlign:'center'}}>
                <h2 style={{fontSize:'24px', fontWeight:800, color:'#fff', marginBottom:'8px'}}>💀 Game Over!</h2>
                <div style={{marginBottom:'12px'}}>
                  <p style={{color:'#fff', fontSize:'18px'}}>Final Score: <span style={{fontWeight:800}}>{score}</span></p>
                  <p style={{color:'#fff', fontSize:'18px'}}>Distance: <span style={{fontWeight:800}}>{distance}m</span></p>
                  {score > highScore && score > 0 && (
                    <p style={{color:'#fde047', fontSize:'22px', fontWeight:800}}>
                      🏆 NEW HIGH SCORE! 🏆
                    </p>
                  )}
                  {score <= highScore && highScore > 0 && (
                    <p style={{color:'#fff'}}>High Score: {highScore}</p>
                  )}
                </div>
                <button
                  onClick={handleRestart}
                  style={{background:'#fff', color:'#dc2626', fontWeight:800, padding:'12px 24px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'18px'}}
                >
                  🔄 Play Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NinjaRunGame;