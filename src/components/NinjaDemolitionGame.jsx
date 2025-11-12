import React, { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 4;
const BRICK_WIDTH = 48;
const BRICK_HEIGHT = 16;

const LEVELS = [
  {
    name: 'Level 1: Novice',
    bricks: [
      { x: 24, y: 40, type: 0, health: 1 },
      { x: 72, y: 40, type: 1, health: 1 },
      { x: 120, y: 40, type: 0, health: 1 },
      { x: 168, y: 40, type: 1, health: 1 },
      { x: 216, y: 40, type: 0, health: 1 },
      { x: 264, y: 40, type: 1, health: 1 },
      { x: 312, y: 40, type: 0, health: 1 },
      { x: 360, y: 40, type: 1, health: 1 },
      { x: 408, y: 40, type: 0, health: 1 },
      { x: 24, y: 60, type: 1, health: 1 },
      { x: 72, y: 60, type: 0, health: 1 },
      { x: 120, y: 60, type: 1, health: 1 },
      { x: 168, y: 60, type: 0, health: 1 },
      { x: 216, y: 60, type: 2, health: 2 },
      { x: 264, y: 60, type: 0, health: 1 },
      { x: 312, y: 60, type: 1, health: 1 },
      { x: 360, y: 60, type: 0, health: 1 },
      { x: 408, y: 60, type: 1, health: 1 },
    ],
  },
  {
    name: 'Level 2: Warrior',
    bricks: [
      { x: 48, y: 40, type: 0, health: 1 },
      { x: 144, y: 40, type: 1, health: 1 },
      { x: 240, y: 40, type: 0, health: 1 },
      { x: 336, y: 40, type: 1, health: 1 },
      { x: 24, y: 60, type: 2, health: 2 },
      { x: 72, y: 60, type: 0, health: 1 },
      { x: 120, y: 60, type: 1, health: 1 },
      { x: 168, y: 60, type: 0, health: 1 },
      { x: 216, y: 60, type: 1, health: 1 },
      { x: 264, y: 60, type: 0, health: 1 },
      { x: 312, y: 60, type: 1, health: 1 },
      { x: 360, y: 60, type: 0, health: 1 },
      { x: 408, y: 60, type: 2, health: 2 },
      { x: 48, y: 80, type: 1, health: 1 },
      { x: 144, y: 80, type: 0, health: 1 },
      { x: 240, y: 80, type: 2, health: 2 },
      { x: 336, y: 80, type: 0, health: 1 },
    ],
  },
  {
    name: 'Level 3: Master Ninja',
    bricks: [
      { x: 24, y: 40, type: 2, health: 2 },
      { x: 72, y: 40, type: 1, health: 1 },
      { x: 120, y: 40, type: 2, health: 2 },
      { x: 168, y: 40, type: 1, health: 1 },
      { x: 216, y: 40, type: 2, health: 2 },
      { x: 264, y: 40, type: 1, health: 1 },
      { x: 312, y: 40, type: 2, health: 2 },
      { x: 360, y: 40, type: 1, health: 1 },
      { x: 408, y: 40, type: 2, health: 2 },
      { x: 24, y: 60, type: 0, health: 1 },
      { x: 72, y: 60, type: 2, health: 2 },
      { x: 120, y: 60, type: 0, health: 1 },
      { x: 168, y: 60, type: 2, health: 2 },
      { x: 216, y: 60, type: 0, health: 1 },
      { x: 264, y: 60, type: 2, health: 2 },
      { x: 312, y: 60, type: 0, health: 1 },
      { x: 360, y: 60, type: 2, health: 2 },
      { x: 408, y: 60, type: 0, health: 1 },
      { x: 48, y: 80, type: 2, health: 2 },
      { x: 144, y: 80, type: 0, health: 1 },
      { x: 240, y: 80, type: 2, health: 2 },
      { x: 336, y: 80, type: 0, health: 1 },
    ],
  },
  {
    name: 'Level 4: Shadow Strike',
    bricks: [
      { x: 24, y: 40, type: 1, health: 1 },
      { x: 72, y: 40, type: 2, health: 2 },
      { x: 120, y: 40, type: 1, health: 1 },
      { x: 168, y: 40, type: 2, health: 2 },
      { x: 216, y: 40, type: 1, health: 1 },
      { x: 264, y: 40, type: 2, health: 2 },
      { x: 312, y: 40, type: 1, health: 1 },
      { x: 360, y: 40, type: 2, health: 2 },
      { x: 408, y: 40, type: 1, health: 1 },
      { x: 48, y: 60, type: 0, health: 1 },
      { x: 96, y: 60, type: 1, health: 2 },
      { x: 144, y: 60, type: 0, health: 1 },
      { x: 192, y: 60, type: 2, health: 2 },
      { x: 240, y: 60, type: 0, health: 1 },
      { x: 288, y: 60, type: 1, health: 2 },
      { x: 336, y: 60, type: 0, health: 1 },
      { x: 384, y: 60, type: 2, health: 2 },
      { x: 432, y: 60, type: 0, health: 1 },
    ],
  },
  
  {
    name: 'Level 5: Iron Fortress',
    bricks: [
      { x: 24, y: 40, type: 2, health: 2 },
      { x: 72, y: 40, type: 2, health: 2 },
      { x: 120, y: 40, type: 1, health: 1 },
      { x: 168, y: 40, type: 2, health: 3 },
      { x: 216, y: 40, type: 2, health: 2 },
      { x: 264, y: 40, type: 2, health: 2 },
      { x: 312, y: 40, type: 1, health: 1 },
      { x: 360, y: 40, type: 2, health: 3 },
      { x: 408, y: 40, type: 2, health: 2 },
      { x: 48, y: 60, type: 0, health: 1 },
      { x: 96, y: 60, type: 1, health: 2 },
      { x: 144, y: 60, type: 2, health: 3 },
      { x: 192, y: 60, type: 0, health: 1 },
      { x: 240, y: 60, type: 2, health: 3 },
      { x: 288, y: 60, type: 1, health: 2 },
      { x: 336, y: 60, type: 0, health: 1 },
      { x: 384, y: 60, type: 2, health: 3 },
      { x: 432, y: 60, type: 1, health: 2 },
    ],
  },
  
  {
    name: 'Level 6: Silent Storm',
    bricks: [
      { x: 24, y: 40, type: 1, health: 1 },
      { x: 72, y: 40, type: 2, health: 3 },
      { x: 120, y: 40, type: 2, health: 2 },
      { x: 168, y: 40, type: 1, health: 2 },
      { x: 216, y: 40, type: 2, health: 3 },
      { x: 264, y: 40, type: 1, health: 1 },
      { x: 312, y: 40, type: 2, health: 2 },
      { x: 360, y: 40, type: 2, health: 3 },
      { x: 408, y: 40, type: 1, health: 1 },
      { x: 48, y: 60, type: 0, health: 1 },
      { x: 96, y: 60, type: 1, health: 2 },
      { x: 144, y: 60, type: 0, health: 1 },
      { x: 192, y: 60, type: 2, health: 3 },
      { x: 240, y: 60, type: 0, health: 1 },
      { x: 288, y: 60, type: 1, health: 2 },
      { x: 336, y: 60, type: 0, health: 1 },
      { x: 384, y: 60, type: 2, health: 3 },
      { x: 432, y: 60, type: 1, health: 2 },
      { x: 72, y: 80, type: 2, health: 3 },
      { x: 168, y: 80, type: 1, health: 1 },
      { x: 264, y: 80, type: 2, health: 3 },
      { x: 360, y: 80, type: 1, health: 2 },
    ],
  },
  
  {
    name: 'Level 7: Inferno Rage',
    bricks: [
      { x: 24, y: 40, type: 2, health: 3 },
      { x: 72, y: 40, type: 1, health: 2 },
      { x: 120, y: 40, type: 2, health: 3 },
      { x: 168, y: 40, type: 2, health: 3 },
      { x: 216, y: 40, type: 1, health: 2 },
      { x: 264, y: 40, type: 2, health: 3 },
      { x: 312, y: 40, type: 2, health: 3 },
      { x: 360, y: 40, type: 1, health: 2 },
      { x: 408, y: 40, type: 2, health: 3 },
      { x: 48, y: 60, type: 0, health: 2 },
      { x: 96, y: 60, type: 2, health: 3 },
      { x: 144, y: 60, type: 1, health: 3 },
      { x: 192, y: 60, type: 2, health: 4 },
      { x: 240, y: 60, type: 1, health: 3 },
      { x: 288, y: 60, type: 2, health: 4 },
      { x: 336, y: 60, type: 1, health: 3 },
      { x: 384, y: 60, type: 2, health: 4 },
    ],
  },
  
  {
    name: 'Level 8: Dragon’s Breath',
    bricks: [
      { x: 24, y: 40, type: 2, health: 4 },
      { x: 72, y: 40, type: 1, health: 3 },
      { x: 120, y: 40, type: 2, health: 4 },
      { x: 168, y: 40, type: 1, health: 3 },
      { x: 216, y: 40, type: 2, health: 4 },
      { x: 264, y: 40, type: 1, health: 3 },
      { x: 312, y: 40, type: 2, health: 4 },
      { x: 360, y: 40, type: 1, health: 3 },
      { x: 408, y: 40, type: 2, health: 4 },
      { x: 48, y: 60, type: 2, health: 4 },
      { x: 96, y: 60, type: 1, health: 3 },
      { x: 144, y: 60, type: 2, health: 4 },
      { x: 192, y: 60, type: 1, health: 3 },
      { x: 240, y: 60, type: 2, health: 4 },
      { x: 288, y: 60, type: 1, health: 3 },
      { x: 336, y: 60, type: 2, health: 4 },
      { x: 384, y: 60, type: 1, health: 3 },
    ],
  },
  
  {
    name: 'Level 9: Ultimate Trial',
    bricks: [
      { x: 24, y: 40, type: 2, health: 4 },
      { x: 72, y: 40, type: 1, health: 3 },
      { x: 120, y: 40, type: 2, health: 4 },
      { x: 168, y: 40, type: 2, health: 5 },
      { x: 216, y: 40, type: 2, health: 5 },
      { x: 264, y: 40, type: 2, health: 5 },
      { x: 312, y: 40, type: 2, health: 4 },
      { x: 360, y: 40, type: 1, health: 3 },
      { x: 408, y: 40, type: 2, health: 4 },
      { x: 48, y: 60, type: 2, health: 5 },
      { x: 96, y: 60, type: 1, health: 3 },
      { x: 144, y: 60, type: 2, health: 5 },
      { x: 192, y: 60, type: 1, health: 3 },
      { x: 240, y: 60, type: 2, health: 5 },
      { x: 288, y: 60, type: 1, health: 3 },
      { x: 336, y: 60, type: 2, health: 5 },
      { x: 384, y: 60, type: 1, health: 3 },
      { x: 432, y: 60, type: 2, health: 5 },
    ],
  },
  
  {
    name: 'Level 10: Master of Shadows',
    bricks: [
      { x: 24, y: 40, type: 2, health: 5 },
      { x: 72, y: 40, type: 2, health: 5 },
      { x: 120, y: 40, type: 2, health: 5 },
      { x: 168, y: 40, type: 1, health: 4 },
      { x: 216, y: 40, type: 1, health: 4 },
      { x: 264, y: 40, type: 1, health: 4 },
      { x: 312, y: 40, type: 2, health: 5 },
      { x: 360, y: 40, type: 2, health: 5 },
      { x: 408, y: 40, type: 2, health: 5 },
      { x: 48, y: 60, type: 2, health: 5 },
      { x: 96, y: 60, type: 1, health: 4 },
      { x: 144, y: 60, type: 2, health: 5 },
      { x: 192, y: 60, type: 1, health: 4 },
      { x: 240, y: 60, type: 2, health: 5 },
      { x: 288, y: 60, type: 1, health: 4 },
      { x: 336, y: 60, type: 2, health: 5 },
      { x: 384, y: 60, type: 1, health: 4 },
      { x: 432, y: 60, type: 2, health: 5 },
      { x: 72, y: 80, type: 2, health: 6 },
      { x: 168, y: 80, type: 1, health: 5 },
      { x: 264, y: 80, type: 2, health: 6 },
      { x: 360, y: 80, type: 1, health: 5 },
      { x: 216, y: 100, type: 2, health: 7 },
    ],
  },
  
];

function initGame(levelIndex = 0) {
  const level = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
  return {
    paddle: {
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    balls: [
      {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        vx: 0,
        vy: 0,
        radius: BALL_RADIUS,
      },
    ],
    bricks: level.bricks.map(b => ({
      ...b,
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
    })),
    powerups: [],
    score: 0,
    lives: 3,
    level: levelIndex,
    ballLaunched: false,
  };
}

export default function NinjaDemolition() {
  const [gameState, setGameState] = useState(initGame(0));
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const canvasRef = useRef(null);

  const keysPressed = useRef({});
  const gameLoopRef = useRef(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for arrow keys and game control keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === 'Enter' || e.key === 'l' || e.key === 'L') {
        setGameState(prev => {
          if (!prev.ballLaunched) {
            return {
              ...prev,
              ballLaunched: true,
              balls: prev.balls.map(b => ({
                ...b,
                vx: (Math.random() - 0.5) * 6,
                vy: -5,
              }))
            };
          }
          return prev;
        });
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
      }

      // CHEAT CODES - SECRET
      if (e.key === 'c' || e.key === 'C') {
        setGameState(prev => ({
          ...prev,
          bricks: [],
        }));
      }

      if (e.key === 'x' || e.key === 'X') {
        setGameState(prev => ({
          ...prev,
          score: prev.score + 5000,
        }));
      }

      if (e.key === 'z' || e.key === 'Z') {
        setGameState(prev => ({
          ...prev,
          lives: Math.min(prev.lives + 10, 99),
        }));
      }

      if (e.key === 'v' || e.key === 'V') {
        setGameState(prev => ({
          ...prev,
          balls: prev.balls.length < 10 ? [
            ...prev.balls,
            ...prev.balls.map(b => ({
              ...b,
              vx: b.vx + (Math.random() - 0.5) * 4,
              vy: b.vy + (Math.random() - 0.5) * 4,
            }))
          ] : prev.balls,
        }));
      }

      if (e.key === 'w' || e.key === 'W') {
        setGameState(prev => ({
          ...prev,
          paddle: {
            ...prev.paddle,
            width: Math.min(prev.paddle.width + 40, 200),
          },
        }));
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || gameWon || isPaused) return;

    const gameLoop = () => {
      setGameState(prevState => {
        let state = JSON.parse(JSON.stringify(prevState));

        // Paddle movement
        if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
          state.paddle.x = Math.max(0, state.paddle.x - 7);
        }
        if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
          state.paddle.x = Math.min(CANVAS_WIDTH - state.paddle.width, state.paddle.x + 7);
        }

        // Ball not launched - stick to paddle
        if (!state.ballLaunched) {
          state.balls[0].x = state.paddle.x + state.paddle.width / 2;
          state.balls[0].y = state.paddle.y - 10;
          return state;
        }

        // Update ball position
        state.balls = state.balls.map(ball => {
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall collision
          if (ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH) {
            ball.vx *= -1;
          }
          if (ball.y - ball.radius < 0) {
            ball.vy *= -1;
          }

          return ball;
        }).filter(ball => ball.y - ball.radius < CANVAS_HEIGHT);

        // Paddle collision
        if (state.balls.length > 0) {
          state.balls = state.balls.map(ball => {
            const p = state.paddle;
            if (
              ball.x > p.x &&
              ball.x < p.x + p.width &&
              ball.y + ball.radius > p.y &&
              ball.y + ball.radius < p.y + p.height
            ) {
              ball.vy = -Math.abs(ball.vy);
              const hitPos = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
              ball.vx = hitPos * 7;
            }
            return ball;
          });
        }

        // Brick collision
        state.balls = state.balls.map(ball => {
          state.bricks = state.bricks.filter(brick => {
            if (
              ball.x > brick.x &&
              ball.x < brick.x + brick.width &&
              ball.y > brick.y &&
              ball.y < brick.y + brick.height
            ) {
              brick.health--;
              
              const overlapTop = (ball.y + ball.radius) - brick.y;
              const overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);
              const overlapLeft = (ball.x + ball.radius) - brick.x;
              const overlapRight = (brick.x + brick.width) - (ball.x - ball.radius);

              const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

              if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                ball.vy *= -1;
              } else {
                ball.vx *= -1;
              }

              state.score += 10 * brick.health;

              // Power-up drop
              if (Math.random() < 0.35 && brick.health <= 0) {
                const powerupTypes = ['wide', 'slow', 'multi', 'sticky', 'life'];
                state.powerups.push({
                  x: brick.x + brick.width / 2 - 8,
                  y: brick.y + brick.height,
                  type: powerupTypes[Math.floor(Math.random() * powerupTypes.length)],
                  vx: 0,
                  vy: 2,
                });
              }

              return brick.health > 0;
            }
            return true;
          });
          return ball;
        });

        // Power-up movement and collection
        state.powerups = state.powerups.map(p => {
          p.y += p.vy;
          return p;
        }).filter(p => p.y < CANVAS_HEIGHT);

        state.powerups = state.powerups.filter(p => {
          const paddle = state.paddle;
          if (
            p.x < paddle.x + paddle.width &&
            p.x + 16 > paddle.x &&
            p.y < paddle.y + paddle.height &&
            p.y + 16 > paddle.y
          ) {
            switch (p.type) {
              case 'wide':
                state.paddle.width = Math.min(120, state.paddle.width + 20);
                break;
              case 'slow':
                state.balls = state.balls.map(b => ({
                  ...b,
                  vx: b.vx * 0.6,
                  vy: b.vy * 0.6,
                }));
                break;
              case 'multi':
                if (state.balls.length < 5) {
                  state.balls = [
                    ...state.balls,
                    ...state.balls.map(b => ({
                      ...b,
                      vx: b.vx + (Math.random() - 0.5) * 3,
                      vy: b.vy + (Math.random() - 0.5) * 3,
                    })),
                  ];
                }
                break;
              case 'sticky':
                // Reset ball to paddle position and set ballLaunched to false
                state.ballLaunched = false;
                state.balls = [{
                  x: state.paddle.x + state.paddle.width / 2,
                  y: state.paddle.y - 10,
                  vx: 0,
                  vy: 0,
                  radius: BALL_RADIUS,
                }];
                break;
              case 'life':
                state.lives += 1;
                break;
              default:
                break;
            }
            return false;
          }
          return true;
        });

        // Check game over
        if (state.balls.length === 0 && state.ballLaunched) {
          state.lives--;
          if (state.lives <= 0) {
            setGameOver(true);
          } else {
            state.ballLaunched = false;
            state.balls = [{
              x: state.paddle.x + state.paddle.width / 2,
              y: state.paddle.y - 10,
              vx: 0,
              vy: 0,
              radius: BALL_RADIUS,
            }];
            state.powerups = [];
          }
        }

        // Check win
        if (state.bricks.length === 0 && state.ballLaunched) {
          setGameWon(true);
        }

        return state;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver, gameWon, isPaused]);

  // Render with modern graphics
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Modern gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid background effect
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Modern bricks with gradient and glow
    const brickColors = [
      { color: '#ff006e', glow: '#ff3385' },
      { color: '#00d9ff', glow: '#33e9ff' },
      { color: '#ffd700', glow: '#ffed4e' },
      { color: '#00ff88', glow: '#4dffaa' },
      { color: '#ff00ff', glow: '#ff33ff' },
    ];

    gameState.bricks.forEach(brick => {
      const colorSet = brickColors[brick.type % brickColors.length];
      
      // Glow effect
      ctx.shadowColor = colorSet.glow;
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Gradient fill
      const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
      gradient.addColorStop(0, colorSet.glow);
      gradient.addColorStop(1, colorSet.color);
      ctx.fillStyle = gradient;

      // Rounded brick
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(brick.x + radius, brick.y);
      ctx.lineTo(brick.x + brick.width - radius, brick.y);
      ctx.quadraticCurveTo(brick.x + brick.width, brick.y, brick.x + brick.width, brick.y + radius);
      ctx.lineTo(brick.x + brick.width, brick.y + brick.height - radius);
      ctx.quadraticCurveTo(brick.x + brick.width, brick.y + brick.height, brick.x + brick.width - radius, brick.y + brick.height);
      ctx.lineTo(brick.x + radius, brick.y + brick.height);
      ctx.quadraticCurveTo(brick.x, brick.y + brick.height, brick.x, brick.y + brick.height - radius);
      ctx.lineTo(brick.x, brick.y + radius);
      ctx.quadraticCurveTo(brick.x, brick.y, brick.x + radius, brick.y);
      ctx.closePath();
      ctx.fill();

      // Border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = colorSet.glow;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Health indicator
      if (brick.health > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brick.health, brick.x + brick.width / 2, brick.y + brick.height / 2);
      }
    });

    // Modern paddle with gradient and glow
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const paddleGradient = ctx.createLinearGradient(gameState.paddle.x, gameState.paddle.y, gameState.paddle.x, gameState.paddle.y + gameState.paddle.height);
    paddleGradient.addColorStop(0, '#00ffaa');
    paddleGradient.addColorStop(0.5, '#00dd88');
    paddleGradient.addColorStop(1, '#00bb66');
    ctx.fillStyle = paddleGradient;

    // Rounded paddle
    const paddleRadius = 5;
    ctx.beginPath();
    ctx.moveTo(gameState.paddle.x + paddleRadius, gameState.paddle.y);
    ctx.lineTo(gameState.paddle.x + gameState.paddle.width - paddleRadius, gameState.paddle.y);
    ctx.quadraticCurveTo(gameState.paddle.x + gameState.paddle.width, gameState.paddle.y, gameState.paddle.x + gameState.paddle.width, gameState.paddle.y + paddleRadius);
    ctx.lineTo(gameState.paddle.x + gameState.paddle.width, gameState.paddle.y + gameState.paddle.height);
    ctx.lineTo(gameState.paddle.x, gameState.paddle.y + gameState.paddle.height);
    ctx.lineTo(gameState.paddle.x, gameState.paddle.y + paddleRadius);
    ctx.quadraticCurveTo(gameState.paddle.x, gameState.paddle.y, gameState.paddle.x + paddleRadius, gameState.paddle.y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Modern balls with glow
    gameState.balls.forEach(ball => {
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 12;
      
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffff88';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(ball.x - 1, ball.y - 1, ball.radius / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Modern power-ups with glow
    gameState.powerups.forEach(powerup => {
      const powerupColors = {
        wide: { main: '#ff0099', glow: '#ff33bb' },
        slow: '#00ccff',
        multi: '#ffcc00',
        sticky: '#ff6600',
        life: '#00ff00'
      };

      const color = powerupColors[powerup.type];
      ctx.shadowColor = typeof color === 'object' ? color.glow : color;
      ctx.shadowBlur = 10;

      ctx.fillStyle = typeof color === 'object' ? color.main : color;
      const r = 3;
      ctx.beginPath();
      ctx.moveTo(powerup.x + r, powerup.y);
      ctx.lineTo(powerup.x + 16 - r, powerup.y);
      ctx.quadraticCurveTo(powerup.x + 16, powerup.y, powerup.x + 16, powerup.y + r);
      ctx.lineTo(powerup.x + 16, powerup.y + 16 - r);
      ctx.quadraticCurveTo(powerup.x + 16, powerup.y + 16, powerup.x + 16 - r, powerup.y + 16);
      ctx.lineTo(powerup.x + r, powerup.y + 16);
      ctx.quadraticCurveTo(powerup.x, powerup.y + 16, powerup.x, powerup.y + 16 - r);
      ctx.lineTo(powerup.x, powerup.y + r);
      ctx.quadraticCurveTo(powerup.x, powerup.y, powerup.x + r, powerup.y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = typeof color === 'object' ? color.glow : color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = powerup.type === 'wide' ? 'W' : powerup.type === 'slow' ? 'S' : powerup.type === 'multi' ? 'M' : powerup.type === 'sticky' ? 'T' : 'L';
      ctx.fillText(label, powerup.x + 8, powerup.y + 8);
    });

    // Launch message with modern style
    if (!gameState.ballLaunched) {
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      
      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.font = 'bold 18px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PRESS ENTER OR L', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15);
      ctx.font = 'bold 14px Courier New';
      ctx.fillText('TO LAUNCH', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
    }

    ctx.shadowBlur = 0;
  }, [gameState]);

  const handleRestart = () => {
    setGameState(initGame(0));
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
  };

  const handleNextLevel = () => {
    const nextLevel = Math.min((gameState.level || 0) + 1, LEVELS.length - 1);
    setGameState(initGame(nextLevel));
    setGameWon(false);
    setIsPaused(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Courier New", monospace',
      overflow: 'hidden',
    }}>
      {/* Animated background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 200, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 150, 0.1) 0%, transparent 50%)',
        zIndex: -1,
        pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{
          color: '#00ffff',
          fontSize: '48px',
          margin: 0,
          textShadow: '0 0 20px #00ffff, 0 0 40px #00ffaa',
          fontWeight: 'bold',
          letterSpacing: '3px',
        }}>
          🥷 NINJA-DEMOLITION 🥷
        </h1>
        <div style={{
          height: '2px',
          width: '200px',
          background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
          margin: '15px auto',
        }} />
        <p style={{
          color: '#00ff88',
          fontSize: '14px',
          margin: '8px 0 0 0',
          fontWeight: '500',
          letterSpacing: '2px',
        }}>
          LEVEL {gameState.level + 1} • {LEVELS[gameState.level].name}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '50px',
        marginBottom: '25px',
        justifyContent: 'center',
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          border: '2px solid #00ff88',
          borderRadius: '8px',
          padding: '15px 30px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>SCORE</div>
          <div style={{ color: '#00ffaa', fontSize: '24px', fontWeight: 'bold' }}>{gameState.score}</div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255, 0, 150, 0.1)',
          border: '2px solid #ff0099',
          borderRadius: '8px',
          padding: '15px 30px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ color: '#ff0099', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>LIVES</div>
          <div style={{ color: '#ff33cc', fontSize: '24px', fontWeight: 'bold' }}>❤️ {gameState.lives}</div>
        </div>
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            padding: '12px 28px',
            backgroundColor: isPaused ? 'rgba(255, 0, 100, 0.8)' : 'rgba(0, 255, 136, 0.8)',
            color: '#000',
            border: '2px solid ' + (isPaused ? '#ff0099' : '#00ff88'),
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backdropFilter: 'blur(10px)',
            boxShadow: isPaused ? '0 0 20px rgba(255, 0, 100, 0.5)' : '0 0 20px rgba(0, 255, 136, 0.5)',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </div>

      <div style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '3px solid #00ffff',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1)',
        backgroundColor: '#000',
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            display: 'block',
            backgroundColor: '#0a0e27',
          }}
        />
      </div>

      {(gameOver || gameWon) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)',
        }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '3px solid ' + (gameWon && gameState.bricks.length === 0 ? '#00ff88' : '#ff0099'),
            borderRadius: '16px',
            padding: '50px 40px',
            textAlign: 'center',
            boxShadow: '0 0 50px ' + (gameWon && gameState.bricks.length === 0 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 150, 0.5)'),
            maxWidth: '500px',
          }}>
            <h2 style={{
              fontSize: '42px',
              margin: '0 0 20px 0',
              color: gameWon && gameState.bricks.length === 0 ? '#00ff88' : '#ff0099',
              textShadow: gameWon && gameState.bricks.length === 0 ? '0 0 20px #00ff88' : '0 0 20px #ff0099',
              fontWeight: 'bold',
              letterSpacing: '2px',
            }}>
              {gameWon && gameState.bricks.length === 0 ? '🥷 LEVEL COMPLETE!' : '💀 GAME OVER'}
            </h2>
            
            <div style={{
              backgroundColor: 'rgba(0, 255, 200, 0.1)',
              border: '2px solid rgba(0, 255, 200, 0.3)',
              borderRadius: '8px',
              padding: '20px',
              margin: '20px 0',
            }}>
              <p style={{
                color: '#00ffaa',
                fontSize: '18px',
                margin: '0 0 10px 0',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>FINAL SCORE</p>
              <p style={{
                color: '#00ffff',
                fontSize: '42px',
                margin: 0,
                fontWeight: 'bold',
                textShadow: '0 0 20px #00ffff',
              }}>
                {gameState.score}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button
                onClick={handleRestart}
                style={{
                  padding: '14px 32px',
                  backgroundColor: 'rgba(255, 0, 100, 0.8)',
                  color: '#fff',
                  border: '2px solid #ff0099',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 20px rgba(255, 0, 100, 0.5)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 0 30px rgba(255, 0, 100, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 0, 100, 0.5)';
                }}
              >
                🔄 RESTART
              </button>
              {gameWon && gameState.level < LEVELS.length - 1 && (
                <button
                  onClick={handleNextLevel}
                  style={{
                    padding: '14px 32px',
                    backgroundColor: 'rgba(0, 255, 136, 0.8)',
                    color: '#000',
                    border: '2px solid #00ff88',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
                  }}
                >
                  ⬆️ NEXT LEVEL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '30px',
        color: '#00ffaa',
        fontSize: '12px',
        textAlign: 'center',
        maxWidth: '700px',
        backgroundColor: 'rgba(0, 255, 136, 0.05)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: '8px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        lineHeight: '1.8',
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '12px', color: '#00ffff', letterSpacing: '1px' }}>🎮 GAME CONTROLS</p>
        <p style={{ margin: '6px 0' }}>⬅️ <span style={{ color: '#00ffaa' }}>Arrow Keys</span> or <span style={{ color: '#00ffaa' }}>A / D</span> = Move Paddle</p>
        <p style={{ margin: '6px 0' }}>⬆️ <span style={{ color: '#00ffaa' }}>ENTER</span> or <span style={{ color: '#00ffaa' }}>L</span> = Launch Ball</p>
        <p style={{ margin: '6px 0' }}>⏸️ <span style={{ color: '#00ffaa' }}>P</span> = Pause / Resume</p>
        <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#00dd88', opacity: 0.7 }}>💥 Power-ups: <span style={{ color: '#ffff00' }}>W</span>=Wide | <span style={{ color: '#ffff00' }}>S</span>=Slow | <span style={{ color: '#ffff00' }}>M</span>=Multi | <span style={{ color: '#ffff00' }}>T</span>=Sticky | <span style={{ color: '#ffff00' }}>L</span>=Life</p>
      </div>
    </div>
  );
}