<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatBot } from './composables/useChatBot'
import './style.css'

const {
  messages,
  inputText,
  isListening,
  isSpeaking,
  startListening,
  sendMessage
} = useChatBot()

const chatAreaRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when messages change
watch(messages, async () => {
  await nextTick()
  if (chatAreaRef.value) {
    chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
  }
}, { deep: true })

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chatbot-container">
    <!-- Cartoon Character Area -->
    <div class="character-area">
      <svg 
        class="character-svg" 
        :class="{ speaking: isSpeaking }"
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Robot Head -->
        <rect x="20" y="20" width="60" height="50" rx="10" fill="#ffffff" stroke="#333" stroke-width="3"/>
        <!-- Eyes -->
        <circle cx="35" cy="40" r="5" fill="#333">
          <animate v-if="isSpeaking" attributeName="r" values="5;2;5" dur="0.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="65" cy="40" r="5" fill="#333">
          <animate v-if="isSpeaking" attributeName="r" values="5;2;5" dur="0.2s" repeatCount="indefinite" />
        </circle>
        <!-- Mouth -->
        <path d="M 35 55 Q 50 65 65 55" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round">
          <animate v-if="isSpeaking" attributeName="d" values="M 35 55 Q 50 65 65 55; M 35 60 Q 50 50 65 60; M 35 55 Q 50 65 65 55" dur="0.3s" repeatCount="indefinite" />
        </path>
        <!-- Antenna -->
        <line x1="50" y1="20" x2="50" y2="5" stroke="#333" stroke-width="3"/>
        <circle cx="50" cy="5" r="4" fill="#ff3b30">
          <animate attributeName="fill" values="#ff3b30;#ffcc00;#ff3b30" dur="2s" repeatCount="indefinite" />
        </circle>
        <!-- Ears -->
        <rect x="10" y="35" width="10" height="20" rx="2" fill="#ddd" stroke="#333" stroke-width="2"/>
        <rect x="80" y="35" width="10" height="20" rx="2" fill="#ddd" stroke="#333" stroke-width="2"/>
      </svg>
    </div>

    <!-- Chat Messages Area -->
    <div class="chat-area" ref="chatAreaRef">
      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="message"
        :class="msg.sender"
      >
        {{ msg.text }}
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <button 
        class="icon-btn" 
        :class="{ listening: isListening }"
        @click="startListening"
        title="Voice Input"
      >
        <!-- Mic Icon SVG -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>
      
      <input 
        v-model="inputText" 
        type="text" 
        class="chat-input" 
        placeholder="Type a message..."
        @keydown="handleKeydown"
      />
      
      <button 
        class="icon-btn" 
        @click="sendMessage"
        :disabled="!inputText.trim()"
        title="Send"
      >
        <!-- Send Icon SVG -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
</template>
