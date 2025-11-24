import { ref, watchEffect } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import { useSnakeGame } from './useSnakeGame'
import { useMinesweeperGame } from './useMinesweeperGame'
import { useTetrisGame } from './useTetrisGame'

interface Game {
  id: string
  name: string
  icon: string
  description: string
}

export function useGameManager() {
  const { t } = useI18n()

  const activeGame = ref<string | null>(null)
  const score = ref(0)
  const isGameRunning = ref(false)
  const isPaused = ref(false)
  const showGameOverModal = ref(false)
  const gameOverTitle = ref('')
  const gameOverMessage = ref('')
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const games = ref<Game[]>([])
  const activeGameName = ref('')

  watchEffect(() => {
    games.value = [
      { id: 'snake', name: t('games.snake'), icon: '🐍', description: t('games.snakeDesc') },
      { id: 'minesweeper', name: t('games.minesweeper'), icon: '💣', description: t('games.mineDesc') },
      { id: 'tetris', name: t('games.tetris'), icon: '🧱', description: t('games.tetrisDesc') }
    ]
  })

  watchEffect(() => {
    activeGameName.value = games.value.find(g => g.id === activeGame.value)?.name || ''
  })

  const isGameActive = (id: string) => activeGame.value === id

  const showGameOver = (title: string, msg: string) => {
    gameOverTitle.value = title
    gameOverMessage.value = msg
    showGameOverModal.value = true
  }

  // Initialize sub-hooks
  // Note: These hooks might need to be called inside the component setup, 
  // but since we are inside a composable that will be called in setup, it's fine.
  // However, `canvasRef` needs to be bound to the element.
  
  // We need to expose the stop methods to `selectGame` and `backToMenu`.
  // But `useSnakeGame` etc need `stopGameCallback` which is `stopGame` here?
  // Circular dependency if we pass `stopGame` to them and they are called inside `stopGame`.
  // `stopGame` in `useGameManager` is "general stop".
  // The specific stop methods stop the interval and event listeners.
  
  // Let's define a mutable `currentStopFunction`
  let currentStopFunction: (() => void) | null = null

  const handleStopGame = () => {
    if (currentStopFunction) {
      currentStopFunction()
      currentStopFunction = null
    }
    isGameRunning.value = false
  }

  const { initSnakeGame, stopSnakeGame } = useSnakeGame(
    canvasRef, 
    score, 
    isGameRunning, 
    isPaused, 
    () => isGameRunning.value = false, // Simple callback
    showGameOver
  )

  const { 
    mineGrid, 
    mineGameOver, 
    mineWon, 
    initMinesweeper, 
    revealCell, 
    toggleFlag 
  } = useMinesweeperGame(score, showGameOver)

  const { initTetris, stopTetrisGame } = useTetrisGame(
    canvasRef,
    score,
    isGameRunning,
    isPaused,
    () => isGameRunning.value = false,
    showGameOver
  )

  const selectGame = (id: string) => {
    // Stop previous game
    handleStopGame()

    activeGame.value = id
    score.value = 0
    isPaused.value = false
    isGameRunning.value = false
    showGameOverModal.value = false
    
    if (id === 'snake') {
      setTimeout(() => {
        initSnakeGame()
        currentStopFunction = stopSnakeGame
      }, 100)
    } else if (id === 'minesweeper') {
      initMinesweeper()
      // Minesweeper doesn't have a loop/interval to stop, but maybe we want to reset state?
      currentStopFunction = () => {} 
    } else if (id === 'tetris') {
      setTimeout(() => {
        initTetris()
        currentStopFunction = stopTetrisGame
      }, 100)
    }
  }

  const backToMenu = () => {
    handleStopGame()
    activeGame.value = null
    showGameOverModal.value = false
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

  return {
    t,
    activeGame,
    score,
    isGameRunning,
    isPaused,
    showGameOverModal,
    gameOverTitle,
    gameOverMessage,
    canvasRef,
    games,
    activeGameName,
    isGameActive,
    selectGame,
    backToMenu,
    restartGame,
    quitGame,
    
    // Snake
    // initSnakeGame, // Internal
    
    // Minesweeper
    mineGrid,
    mineGameOver,
    mineWon,
    revealCell,
    toggleFlag,
    
    // Tetris
    // initTetris // Internal
  }
}
