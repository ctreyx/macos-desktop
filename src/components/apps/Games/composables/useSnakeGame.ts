import { Ref } from 'vue'
import { useI18n } from '../../../../composables/useI18n'

interface Point { x: number, y: number }

export function useSnakeGame(
  canvasRef: Ref<HTMLCanvasElement | null>,
  score: Ref<number>,
  isGameRunning: Ref<boolean>,
  isPaused: Ref<boolean>,
  stopGameCallback: () => void,
  showGameOverCallback: (title: string, msg: string) => void
) {
  const { t } = useI18n()
  
  const snakeGridSize = 20
  const snakeTileCount = 20
  
  let ctx: CanvasRenderingContext2D | null = null
  let gameInterval: number | null = null
  let snake: Point[] = []
  let food: Point = { x: 15, y: 15 }
  let velocity: Point = { x: 0, y: 0 }

  const placeFood = () => {
    food = {
      x: Math.floor(Math.random() * snakeTileCount),
      y: Math.floor(Math.random() * snakeTileCount)
    }
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

  const snakeLoop = () => {
    if (isPaused.value || !isGameRunning.value) return
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y }
    
    // Wall Collision Check
    if (head.x < 0 || head.x >= snakeTileCount || head.y < 0 || head.y >= snakeTileCount) {
      stopSnakeGame()
      showGameOverCallback(t('games.gameOver'), `Score: ${score.value}`)
      return
    }

    if (velocity.x !== 0 || velocity.y !== 0) {
      for (let part of snake) {
        if (part.x === head.x && part.y === head.y) {
          stopSnakeGame()
          showGameOverCallback(t('games.gameOver'), `${t('games.score')}: ${score.value}`)
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

  const stopSnakeGame = () => {
    if (gameInterval) {
      clearInterval(gameInterval)
      gameInterval = null
    }
    window.removeEventListener('keydown', handleSnakeKey)
    stopGameCallback()
  }

  return {
    initSnakeGame,
    stopSnakeGame
  }
}
