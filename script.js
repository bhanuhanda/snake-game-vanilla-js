const GAME_BOARD = document.getElementById('game-board')
const OPTIONS_SCREEN = document.getElementById('options-screen')
const START_BTN = document.getElementById('start-btn')
const RESUME_BTN = document.getElementById('resume-btn')
const PAUSE_BTN = document.getElementById('pause-btn')
const SCORE_BTN = document.getElementById('score-btn')
const SCORE_BOARD = document.getElementById('score-board')

const GRID_SIZE = 32;

let SCORE;

let GAME_OVER;
let GAME_PAUSED = false;

let SNAKE_BODY;
let FOOD_BODY;

let SNAKE_SPEED;
let MOVE_DIRECTION;

let TOUCH_START_COORDINATES;
let TOUCH_END_COORDINATES;

let FOOD_EATEN_COUNT;

let PERSISTED_MOVE_DIRECTION;

function setInitialConfig () {
     SCORE = 0;
     GAME_OVER = false
     GAME_PAUSED = false

     SNAKE_BODY = [{x:16, y:16}]
     FOOD_BODY = getRandomCoordinate()

     SNAKE_SPEED = 14
     MOVE_DIRECTION = { x:1, y:0 }
}

window.addEventListener('keydown', e => handleInput(e))
GAME_BOARD.addEventListener('touchstart', e => handleTouchStart(e))
GAME_BOARD.addEventListener('touchend', e => handleTouchEnd(e))
START_BTN.addEventListener('click', handleGameStart)
RESUME_BTN.addEventListener('click', handlePause)
PAUSE_BTN.addEventListener('click', handlePause)

function getClientCoordinates (coordinates) {
     const { clientX, clientY } = coordinates[0];
     return { clientX, clientY };
}

function getTouchDirection () {
     const movementInX = TOUCH_START_COORDINATES.clientX - TOUCH_END_COORDINATES.clientX;
     const movementInY = TOUCH_START_COORDINATES.clientY - TOUCH_END_COORDINATES.clientY;

     if(Math.abs(movementInX) < Math.abs(movementInY)) {
          if (movementInY > 0) return 'UP'
          return 'DOWN'
     }
     else {
          if (movementInX < 0) return 'RIGHT'
          return 'LEFT'
     }
}
function updateMoveDirection (direction) {
     const currentDirection = MOVE_DIRECTION
     switch (direction) {
          case 'UP':
               if(currentDirection.y !== 0) break
               MOVE_DIRECTION = { x:0, y:-1 }
               break;
          case 'DOWN':
               if(currentDirection.y !== 0) break
               MOVE_DIRECTION = { x:0, y:1 }
               break;
          case 'LEFT':
               if(currentDirection.x !== 0) break
               MOVE_DIRECTION = { x:-1, y:0 }
               break;
          case 'RIGHT':
               if(currentDirection.x !== 0) break
               MOVE_DIRECTION = { x:1, y:0 }
               break;
     }
}

function handleTouchStart ({ changedTouches }) {
     TOUCH_START_COORDINATES = getClientCoordinates (changedTouches);
}

function handleTouchEnd ({ changedTouches }) {
     TOUCH_END_COORDINATES = getClientCoordinates(changedTouches);
     updateMoveDirection(getTouchDirection())
}

function handlePause () {
     if(!GAME_PAUSED) {
          PERSISTED_MOVE_DIRECTION = MOVE_DIRECTION
          MOVE_DIRECTION = { x:0, y:0 }
          GAME_PAUSED = true;

          PAUSE_BTN.style.display = 'none';
          OPTIONS_SCREEN.style.display = 'flex';
     } else {
          MOVE_DIRECTION = PERSISTED_MOVE_DIRECTION
          GAME_PAUSED = false

          PAUSE_BTN.style.display = 'block';
          OPTIONS_SCREEN.style.display = 'none';
     }
}

function handleGameStart () {
     OPTIONS_SCREEN.style.display = 'none';
     setInitialConfig()
     START_BTN.style.display = 'none'
     RESUME_BTN.style.display = 'block'
     PAUSE_BTN.style.display = 'block'
     FOOD_EATEN_COUNT = 0;
     SCORE_BOARD.style.display = 'block'
     playGame()
}

function calculateScore () {
     SCORE = FOOD_EATEN_COUNT * (SNAKE_SPEED-0.5) * 2;
}

function playGame () {
     const gameInProgress = setTimeout(() => {
          if(GAME_OVER) {
               clearTimeout(gameInProgress)
               RESUME_BTN.style.display = 'none'
               START_BTN.style.display = 'block'
               START_BTN.innerText = 'Game Over !! Press to Restart'

               SCORE_BTN.style.display = 'block'
               SCORE_BTN.innerText = 'Score: ' + SCORE
               
               SCORE_BOARD.style.display = 'none'
               PAUSE_BTN.style.display = 'none'

               OPTIONS_SCREEN.style.display = 'flex';
               GAME_BOARD.innerHTML = ''
               return
          }
          calculateScore()
          SCORE_BOARD.innerText = 'Score: ' + SCORE
          updateBoard()
          drawBoard()
          playGame()
     }, 1000/SNAKE_SPEED)
}

function updateBoard () {
     GAME_BOARD.innerHTML = ''
     updateSnakePosition()
     checkDeath()
     updateFoodPosition()
}

function drawBoard () {
     drawSnake(GAME_BOARD)
     drawFood(GAME_BOARD)
}

function updateSnakePosition () {
     if(!GAME_PAUSED) {
          for(let i=SNAKE_BODY.length-2; i>=0; i--) {
               SNAKE_BODY[i+1] = {...SNAKE_BODY[i]}
          }
     }
     SNAKE_BODY[0].x += MOVE_DIRECTION.x
     SNAKE_BODY[0].y += MOVE_DIRECTION.y

     handleWallHit()
}

function drawSnake (GAME_BOARD) {
     for(let i=0; i<SNAKE_BODY.length; i++) {
          const snakeEl = document.createElement('div')
          snakeEl.style.gridRowStart = SNAKE_BODY[i].y
          snakeEl.style.gridColumnStart = SNAKE_BODY[i].x
          snakeEl.classList.add('snake')
          if(i === 0) snakeEl.classList.add('snake-head')
          GAME_BOARD.appendChild(snakeEl)
     }
}

function overlap(food) {
     return SNAKE_BODY.some((point) => point.x === food.x && point.y === food.y)
}

function updateFoodPosition () {
     if(overlap(FOOD_BODY)) {
          expandSnake()
          SNAKE_SPEED = SNAKE_SPEED + 0.5 
          FOOD_BODY = getNextFoodCoordinate()
          FOOD_EATEN_COUNT+=1
     }
}

function drawFood () {
     const foodEl = document.createElement('div')
     foodEl.style.gridRowStart = FOOD_BODY.y
     foodEl.style.gridColumnStart = FOOD_BODY.x
     foodEl.classList.add('food')
     GAME_BOARD.appendChild(foodEl)
}

function handleInput (e) {
     const currentDirection = MOVE_DIRECTION
     switch(e.key) {
          case 'ArrowUp':
          case '8':
          case 'w':
          case 'W':
               if(currentDirection.y !== 0) break
               MOVE_DIRECTION = { x:0, y:-1 }
               GAME_PAUSED = false
               break
          case 'ArrowDown':
          case '2':
          case 's':
          case 'S':
               if(currentDirection.y !== 0) break
               MOVE_DIRECTION = { x:0, y:1 }
               GAME_PAUSED = false
               break
          case 'ArrowLeft':
          case '4':
          case 'a':
          case 'A':
               if(currentDirection.x !== 0) break
               MOVE_DIRECTION = { x:-1, y:0 }
               GAME_PAUSED = false
               break
          case 'ArrowRight':
          case '6':
          case 'd':
          case 'D':
               if(currentDirection.x !== 0) break
               MOVE_DIRECTION = { x:1, y:0 }
               GAME_PAUSED = false
               break
          case 'Escape':
          case ' ':
               handlePause()
     }
}

function expandSnake () {
     SNAKE_BODY.push({ ...SNAKE_BODY[SNAKE_BODY.length-1] })
}

function getNextFoodCoordinate () {
     const newFoodPos = getRandomCoordinate()
     while(overlap(newFoodPos)) {
          getNextFoodCoordinate()
     }
     return newFoodPos
}

function getRandomCoordinate() {
     return { 
          x: Math.floor(Math.random() * GRID_SIZE) + 1,
          y: Math.floor(Math.random() * GRID_SIZE) + 1
     }
}

function checkDeath () {
     if(SNAKE_BODY.some((point, idx) => {
          if(idx !== 0) {
               return point.x === SNAKE_BODY[0].x && point.y === SNAKE_BODY[0].y
          }
     })) {
          GAME_OVER = true
     }
}

function handleWallHit () {
     for(let i=0; i<SNAKE_BODY.length; i++) {
          if (SNAKE_BODY[i].x > GRID_SIZE) {
               SNAKE_BODY[i].x %= GRID_SIZE
          } else if (SNAKE_BODY[i].x < 1) {
               SNAKE_BODY[i].x += GRID_SIZE
          }
          if (SNAKE_BODY[i].y > GRID_SIZE) {
               SNAKE_BODY[i].y %= GRID_SIZE
          } else if (SNAKE_BODY[i].y < 1) {
               SNAKE_BODY[i].y += GRID_SIZE
          }
     }
}
