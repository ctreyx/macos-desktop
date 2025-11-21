<script setup lang="ts">
import { ref, onUnmounted, watchEffect } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const activeGame = ref<string | null>(null)
const score = ref(0)
const highScore = ref(0)
const isGameRunning = ref(false)
const isPaused = ref(false)
const showGameOverModal = ref(false)
const gameOverTitle = ref('')
const gameOverMessage = ref('')

// Canvas Ref (Shared by Snake and Tetris)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let gameInterval: number | null = null

// --- Snake Game State ---
const snakeGridSize = 20
const snakeTileCount = 20
interface Point { x: number, y: number }
let snake: Point[] = []
let food: Point = { x: 15, y: 15 }
let velocity: Point = { x: 0, y: 0 }

// --- Minesweeper State ---
interface MineCell {
  row: number
  col: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}
const mineGrid = ref<MineCell[][]>([])
const mineGameOver = ref(false)
const mineWon = ref(false)
const MINE_ROWS = 10
const MINE_COLS = 10
const MINES_COUNT = 15

// --- Tetris State ---
const TETRIS_ROWS = 20
const TETRIS_COLS = 10
const TETRIS_BLOCK_SIZE = 20
let tetrisBoard: (string | null)[][] = []
let currentPiece: { shape: number[][], color: string, x: number, y: number } | null = null
const TETRIS_SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]]  // Z
]
const TETRIS_COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000']

interface Game {
  id: string
  name: string
  icon: string
  description: string
}

const games = ref<Game[]>([])

watchEffect(() => {
  games.value = [
    { id: 'snake', name: t('games.snake'), icon: '🐍', description: t('games.snakeDesc') },
    { id: 'minesweeper', name: t('games.minesweeper'), icon: '💣', description: t('games.mineDesc') },
    { id: 'tetris', name: t('games.tetris'), icon: '🧱', description: t('games.tetrisDesc') }
  ]
})

const activeGameName = ref('')
watchEffect(() => {
  activeGameName.value = games.value.find(g => g.id === activeGame.value)?.name || ''
})

const isGameActive = (id: string) => activeGame.value === id

const selectGame = (id: string) => {
  activeGame.value = id
  score.value = 0
  isPaused.value = false
  isGameRunning.value = false
  showGameOverModal.value = false
  
  // Clear any existing intervals
  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = null
  }

  if (id === 'snake') {
    setTimeout(initSnakeGame, 100)
  } else if (id === 'minesweeper') {
    initMinesweeper()
  } else if (id === 'tetris') {
    setTimeout(initTetris, 100)
  }
}

const backToMenu = () => {
  stopGame()
  activeGame.value = null
  showGameOverModal.value = false
}

const showGameOver = (title: string, msg: string) => {
  gameOverTitle.value = title
  gameOverMessage.value = msg
  showGameOverModal.value = true
}

const restartGame = () => {
  showGameOverModal.value = false
  if (activeGame.value) {
    selectGame(activeGame.value)
  }
}

const quitGame = () => {
  showGameOverModal.value = false
  backToMenu()
}

const stopGame = () => {
  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = null
  }
  isGameRunning.value = false
  window.removeEventListener('keydown', handleSnakeKey)
  window.removeEventListener('keydown', handleTetrisKey)
}

// --- Snake Logic ---
const initSnakeGame = () => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  score.value = 0
  snake = [{ x: 10, y: 10 }]
  velocity = { x: 0, y: 0 }
  placeFood()
  isGameRunning.value = true
  
  drawSnakeGame()
  gameInterval = window.setInterval(snakeLoop, 100)
  window.addEventListener('keydown', handleSnakeKey)
}

const handleSnakeKey = (e: KeyboardEvent) => {
  if (!isGameRunning.value) return
  switch (e.key) {
    case 'ArrowUp': if (velocity.y !== 1) velocity = { x: 0, y: -1 }; break
    case 'ArrowDown': if (velocity.y !== -1) velocity = { x: 0, y: 1 }; break
    case 'ArrowLeft': if (velocity.x !== 1) velocity = { x: -1, y: 0 }; break
    case 'ArrowRight': if (velocity.x !== -1) velocity = { x: 1, y: 0 }; break
    case ' ': isPaused.value = !isPaused.value; break
  }
}

const placeFood = () => {
  food = {
    x: Math.floor(Math.random() * snakeTileCount),
    y: Math.floor(Math.random() * snakeTileCount)
  }
}

const snakeLoop = () => {
  if (isPaused.value || !isGameRunning.value) return
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y }
  
  // Wall Collision Check
  if (head.x < 0 || head.x >= snakeTileCount || head.y < 0 || head.y >= snakeTileCount) {
    stopGame()
    showGameOver(t('games.gameOver'), `Score: ${score.value}`)
    return
  }

  if (velocity.x !== 0 || velocity.y !== 0) {
    for (let part of snake) {
      if (part.x === head.x && part.y === head.y) {
        stopGame()
        showGameOver(t('games.gameOver'), `${t('games.score')}: ${score.value}`)
        return
      }
    }
    snake.unshift(head)
    if (head.x === food.x && head.y === food.y) {
      score.value += 10
      placeFood()
    } else {
      snake.pop()
    }
  }
  drawSnakeGame()
}

const drawSnakeGame = () => {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  ctx.fillStyle = '#4ade80'
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#86efac' : '#4ade80'
    ctx.fillRect(snake[i].x * snakeGridSize, snake[i].y * snakeGridSize, snakeGridSize - 2, snakeGridSize - 2)
  }
  ctx.fillStyle = '#f87171'
  ctx.fillRect(food.x * snakeGridSize, food.y * snakeGridSize, snakeGridSize - 2, snakeGridSize - 2)
}

// --- Minesweeper Logic ---
const initMinesweeper = () => {
  mineGameOver.value = false
  mineWon.value = false
  score.value = 0
  
  const newGrid: MineCell[][] = []
  for (let r = 0; r < MINE_ROWS; r++) {
    const row: MineCell[] = []
    for (let c = 0; c < MINE_COLS; c++) {
      row.push({ row: r, col: c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 })
    }
    newGrid.push(row)
  }

  let minesPlaced = 0
  while (minesPlaced < MINES_COUNT) {
    const r = Math.floor(Math.random() * MINE_ROWS)
    const c = Math.floor(Math.random() * MINE_COLS)
    if (!newGrid[r][c].isMine) {
      newGrid[r][c].isMine = true
      minesPlaced++
    }
  }

  for (let r = 0; r < MINE_ROWS; r++) {
    for (let c = 0; c < MINE_COLS; c++) {
      if (!newGrid[r][c].isMine) {
        let count = 0
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (r+i >= 0 && r+i < MINE_ROWS && c+j >= 0 && c+j < MINE_COLS) {
              if (newGrid[r+i][c+j].isMine) count++
            }
          }
        }
        newGrid[r][c].neighborMines = count
      }
    }
  }
  mineGrid.value = newGrid
}

const revealCell = (r: number, c: number) => {
  if (mineGameOver.value || mineWon.value || mineGrid.value[r][c].isFlagged || mineGrid.value[r][c].isRevealed) return

  const cell = mineGrid.value[r][c]
  cell.isRevealed = true

  if (cell.isMine) {
    mineGameOver.value = true
    mineGrid.value.forEach(row => row.forEach(c => { if (c.isMine) c.isRevealed = true }))
    showGameOver(t('games.gameOver'), 'You hit a mine!')
    return
  }

  if (cell.neighborMines === 0) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (r+i >= 0 && r+i < MINE_ROWS && c+j >= 0 && c+j < MINE_COLS) {
          revealCell(r+i, c+j)
        }
      }
    }
  }
  checkMineWin()
}

const toggleFlag = (r: number, c: number) => {
  if (mineGameOver.value || mineWon.value || mineGrid.value[r][c].isRevealed) return
  mineGrid.value[r][c].isFlagged = !mineGrid.value[r][c].isFlagged
}

const checkMineWin = () => {
  let revealedCount = 0
  mineGrid.value.forEach(row => row.forEach(c => { if (c.isRevealed) revealedCount++ }))
  if (revealedCount === (MINE_ROWS * MINE_COLS - MINES_COUNT)) {
    mineWon.value = true
    score.value = 100
    showGameOver(t('games.youWon'), 'You successfully cleared all mines.')
  }
}

// --- Tetris Logic ---
const initTetris = () => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  score.value = 0
  isGameRunning.value = true
  tetrisBoard = Array(TETRIS_ROWS).fill(null).map(() => Array(TETRIS_COLS).fill(null))
  spawnTetrisPiece()
  
  drawTetris()
  gameInterval = window.setInterval(tetrisLoop, 500)
  window.addEventListener('keydown', handleTetrisKey)
}

const spawnTetrisPiece = () => {
  const typeIdx = Math.floor(Math.random() * TETRIS_SHAPES.length)
  currentPiece = {
    shape: TETRIS_SHAPES[typeIdx],
    color: TETRIS_COLORS[typeIdx],
    x: Math.floor(TETRIS_COLS / 2) - Math.floor(TETRIS_SHAPES[typeIdx][0].length / 2),
    y: 0
  }
  if (checkTetrisCollision(0, 0)) {
    stopGame()
    showGameOver(t('games.gameOver'), `${t('games.score')}: ${score.value}`)
  }
}

const checkTetrisCollision = (offX: number, offY: number) => {
  if (!currentPiece) return false
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const newX = currentPiece.x + x + offX
        const newY = currentPiece.y + y + offY
        if (newX < 0 || newX >= TETRIS_COLS || newY >= TETRIS_ROWS) return true
        if (newY >= 0 && tetrisBoard[newY][newX]) return true
      }
    }
  }
  return false
}

const rotateTetrisPiece = () => {
  if (!currentPiece) return
  const newShape = currentPiece.shape[0].map((_, i) => currentPiece!.shape.map(row => row[i]).reverse())
  const oldShape = currentPiece.shape
  currentPiece.shape = newShape
  if (checkTetrisCollision(0, 0)) currentPiece.shape = oldShape
}

const tetrisLoop = () => {
  if (isPaused.value || !isGameRunning.value) return
  if (!checkTetrisCollision(0, 1)) {
    currentPiece!.y++
  } else {
    lockTetrisPiece()
    clearTetrisLines()
    spawnTetrisPiece()
  }
  drawTetris()
}

const lockTetrisPiece = () => {
  if (!currentPiece) return
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        if (currentPiece.y + y >= 0) {
          tetrisBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color
        }
      }
    }
  }
}

const clearTetrisLines = () => {
  for (let y = TETRIS_ROWS - 1; y >= 0; y--) {
    if (tetrisBoard[y].every(cell => cell !== null)) {
      tetrisBoard.splice(y, 1)
      tetrisBoard.unshift(Array(TETRIS_COLS).fill(null))
      score.value += 100
      y++
    }
  }
}

const drawTetris = () => {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  for (let y = 0; y < TETRIS_ROWS; y++) {
    for (let x = 0; x < TETRIS_COLS; x++) {
      if (tetrisBoard[y][x]) {
        ctx.fillStyle = tetrisBoard[y][x]!
        ctx.fillRect(x * TETRIS_BLOCK_SIZE, y * TETRIS_BLOCK_SIZE, TETRIS_BLOCK_SIZE - 1, TETRIS_BLOCK_SIZE - 1)
      }
    }
  }
  
  if (currentPiece) {
    ctx.fillStyle = currentPiece.color
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          ctx.fillRect((currentPiece.x + x) * TETRIS_BLOCK_SIZE, (currentPiece.y + y) * TETRIS_BLOCK_SIZE, TETRIS_BLOCK_SIZE - 1, TETRIS_BLOCK_SIZE - 1)
        }
      }
    }
  }
}

const handleTetrisKey = (e: KeyboardEvent) => {
  if (!isGameRunning.value || isPaused.value) return
  if (e.key === 'ArrowLeft' && !checkTetrisCollision(-1, 0)) currentPiece!.x--
  if (e.key === 'ArrowRight' && !checkTetrisCollision(1, 0)) currentPiece!.x++
  if (e.key === 'ArrowDown' && !checkTetrisCollision(0, 1)) currentPiece!.y++
  if (e.key === 'ArrowUp') rotateTetrisPiece()
  if (e.key === ' ') isPaused.value = !isPaused.value
  drawTetris()
}

onUnmounted(() => {
  stopGame()
})
</script>

<template>
  <div class="games-container">
    <!-- Game Selection Menu -->
    <div v-if="!activeGame" class="games-menu">
      <h2>{{ t('games.title') }}</h2>
      <div class="games-grid">
        <div 
          v-for="game in games" 
          :key="game.id" 
          class="game-card"
          @click="selectGame(game.id)"
        >
          <div class="game-icon">{{ game.icon }}</div>
          <div class="game-info">
            <h3>{{ game.name }}</h3>
            <p>{{ game.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Game View -->
    <div v-else class="active-game">
      <div class="game-header">
        <button class="back-btn" @click="backToMenu">← {{ t('games.back') }}</button>
        <h3>{{ activeGameName }}</h3>
        <div class="score">{{ t('games.score') }}: {{ score }}</div>
      </div>

      <div class="game-content">
        <!-- Snake -->
        <div v-if="isGameActive('snake')" class="game-wrapper">
          <canvas ref="canvasRef" width="400" height="400"></canvas>
          <div class="controls-hint">{{ t('games.controls') }}: Arrows | Space ({{ t('games.pause') }})</div>
        </div>

        <!-- Minesweeper -->
        <div v-else-if="isGameActive('minesweeper')" class="game-wrapper">
          <div class="minesweeper-grid" :class="{ 'game-over': mineGameOver }">
            <div v-for="(row, r) in mineGrid" :key="r" class="mine-row">
              <div 
                v-for="(cell, c) in row" 
                :key="c" 
                class="mine-cell"
                :class="{ 
                  'revealed': cell.isRevealed, 
                  'mine': cell.isRevealed && cell.isMine,
                  'flagged': cell.isFlagged
                }"
                @click="revealCell(r, c)"
                @contextmenu.prevent="toggleFlag(r, c)"
              >
                <span v-if="cell.isRevealed && !cell.isMine && cell.neighborMines > 0">
                  {{ cell.neighborMines }}
                </span>
                <span v-if="cell.isRevealed && cell.isMine">💣</span>
                <span v-if="!cell.isRevealed && cell.isFlagged">🚩</span>
              </div>
            </div>
          </div>
          <div class="controls-hint">{{ t('games.controls') }}: Left Click (Reveal) | Right Click (Flag)</div>
        </div>

        <!-- Tetris -->
        <div v-else-if="isGameActive('tetris')" class="game-wrapper">
          <canvas ref="canvasRef" width="200" height="400"></canvas>
          <div class="controls-hint">{{ t('games.controls') }}: Arrows | Space ({{ t('games.pause') }})</div>
        </div>
      </div>

      <!-- Game Over Modal -->
      <div v-if="showGameOverModal" class="modal-overlay">
        <div class="modal-content">
          <h3>{{ gameOverTitle }}</h3>
          <p>{{ gameOverMessage }}</p>
          <div class="modal-actions">
            <button class="modal-btn primary" @click="restartGame">{{ t('games.restart') }}</button>
            <button class="modal-btn secondary" @click="quitGame">{{ t('games.quit') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.games-container {
  height: 100%;
  background: rgba(30, 30, 47, 0.5);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.games-menu {
  padding: 40px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.games-menu h2 {
  margin-bottom: 40px;
  font-weight: 600;
  font-size: 32px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.game-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.game-icon {
  font-size: 56px;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  transition: transform 0.3s;
}

.game-card:hover .game-icon {
  transform: scale(1.1);
}

.game-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.game-info p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.active-game {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-header {
  padding: 16px 24px;
  background: rgba(30, 30, 47, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.game-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
}

.score {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.game-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  position: relative;
}

.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

canvas {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
}

.controls-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Minesweeper Styles */
.minesweeper-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
}

.mine-row {
  display: flex;
  gap: 2px;
}

.mine-cell {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  user-select: none;
  border-radius: 4px;
  transition: background 0.1s;
}

.mine-cell:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mine-cell.revealed {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
}

.mine-cell.mine {
  background: #ff5f57;
  color: white;
}

.mine-cell.flagged {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
}

/* Modal Styles */
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  width: 320px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  backdrop-filter: blur(20px);
}

.modal-content h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: white;
  font-weight: 600;
}

.modal-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
  font-size: 15px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  font-family: inherit;
}

.modal-btn.primary {
  background: #007aff;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.modal-btn.primary:hover {
  background: #0063ce;
  transform: translateY(-1px);
}

.modal-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
