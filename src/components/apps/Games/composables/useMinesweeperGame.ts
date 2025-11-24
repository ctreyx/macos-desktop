import { ref, Ref } from 'vue'
import { useI18n } from '../../../../composables/useI18n'

interface MineCell {
  row: number
  col: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

export function useMinesweeperGame(
  score: Ref<number>,
  showGameOverCallback: (title: string, msg: string) => void
) {
  const { t } = useI18n()
  
  const mineGrid = ref<MineCell[][]>([])
  const mineGameOver = ref(false)
  const mineWon = ref(false)
  const MINE_ROWS = 10
  const MINE_COLS = 10
  const MINES_COUNT = 15

  const checkMineWin = () => {
    let revealedCount = 0
    mineGrid.value.forEach(row => row.forEach(c => { if (c.isRevealed) revealedCount++ }))
    if (revealedCount === (MINE_ROWS * MINE_COLS - MINES_COUNT)) {
      mineWon.value = true
      score.value = 100
      showGameOverCallback(t('games.youWon'), 'You successfully cleared all mines.')
    }
  }

  const revealCell = (r: number, c: number) => {
    if (mineGameOver.value || mineWon.value || mineGrid.value[r][c].isFlagged || mineGrid.value[r][c].isRevealed) return

    const cell = mineGrid.value[r][c]
    cell.isRevealed = true

    if (cell.isMine) {
      mineGameOver.value = true
      mineGrid.value.forEach(row => row.forEach(c => { if (c.isMine) c.isRevealed = true }))
      showGameOverCallback(t('games.gameOver'), 'You hit a mine!')
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

  return {
    mineGrid,
    mineGameOver,
    mineWon,
    initMinesweeper,
    revealCell,
    toggleFlag
  }
}
