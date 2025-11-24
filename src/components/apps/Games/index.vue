<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useGameManager } from './composables/useGameManager'
import './style.css'

const {
  t,
  activeGame,
  score,
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
  mineGrid,
  mineGameOver,
  revealCell,
  toggleFlag
} = useGameManager()

onUnmounted(() => {
  backToMenu() // Ensure cleanup
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
