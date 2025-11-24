import { Ref } from 'vue'
import { useI18n } from '../../../../composables/useI18n'

export function useTetrisGame(
  canvasRef: Ref<HTMLCanvasElement | null>,
  score: Ref<number>,
  isGameRunning: Ref<boolean>,
  isPaused: Ref<boolean>,
  stopGameCallback: () => void,
  showGameOverCallback: (title: string, msg: string) => void
) {
  const { t } = useI18n()

  const TETRIS_ROWS = 20
  const TETRIS_COLS = 10
  const TETRIS_BLOCK_SIZE = 20
  let ctx: CanvasRenderingContext2D | null = null
  let gameInterval: number | null = null
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

  const spawnTetrisPiece = () => {
    const typeIdx = Math.floor(Math.random() * TETRIS_SHAPES.length)
    currentPiece = {
      shape: TETRIS_SHAPES[typeIdx],
      color: TETRIS_COLORS[typeIdx],
      x: Math.floor(TETRIS_COLS / 2) - Math.floor(TETRIS_SHAPES[typeIdx][0].length / 2),
      y: 0
    }
    if (checkTetrisCollision(0, 0)) {
      stopTetrisGame()
      showGameOverCallback(t('games.gameOver'), `${t('games.score')}: ${score.value}`)
    }
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

  const handleTetrisKey = (e: KeyboardEvent) => {
    if (!isGameRunning.value || isPaused.value) return
    if (e.key === 'ArrowLeft' && !checkTetrisCollision(-1, 0)) currentPiece!.x--
    if (e.key === 'ArrowRight' && !checkTetrisCollision(1, 0)) currentPiece!.x++
    if (e.key === 'ArrowDown' && !checkTetrisCollision(0, 1)) currentPiece!.y++
    if (e.key === 'ArrowUp') rotateTetrisPiece()
    if (e.key === ' ') isPaused.value = !isPaused.value
    drawTetris()
  }

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

  const stopTetrisGame = () => {
    if (gameInterval) {
      clearInterval(gameInterval)
      gameInterval = null
    }
    window.removeEventListener('keydown', handleTetrisKey)
    stopGameCallback()
  }

  return {
    initTetris,
    stopTetrisGame
  }
}
