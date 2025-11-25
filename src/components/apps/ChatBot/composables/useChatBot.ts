import { ref, onMounted } from 'vue'

export interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export function useChatBot() {
  const messages = ref<Message[]>([
    {
      id: 1,
      text: 'Hello! I am your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const inputText = ref('')
  const isListening = ref(false)
  const isSpeaking = ref(false)

  // Speech Recognition Setup
  let recognition: any = null

  onMounted(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.lang = 'zh-CN' // Default to Chinese as per user request context
      recognition.interimResults = false

      recognition.onstart = () => {
        isListening.value = true
      }

      recognition.onend = () => {
        isListening.value = false
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        inputText.value = transcript
        sendMessage()
      }
    }
  })

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start()
      } catch (e) {
        console.error('Speech recognition error:', e)
      }
    } else {
      alert('Speech recognition is not supported in this browser.')
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      isSpeaking.value = true
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.onend = () => {
        isSpeaking.value = false
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  const sendMessage = async () => {
    if (!inputText.value.trim()) return

    // User message
    messages.value.push({
      id: Date.now(),
      text: inputText.value,
      sender: 'user',
      timestamp: new Date()
    })

    const userQuery = inputText.value
    inputText.value = ''

    // Simulate AI processing
    setTimeout(() => {
      const response = generateResponse(userQuery)
      messages.value.push({
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      })
      speak(response)
    }, 1000)
  }

  const generateResponse = (query: string): string => {
    // Simple mock logic
    if (query.includes('你好') || query.toLowerCase().includes('hello')) {
      return '你好！很高兴见到你。'
    } else if (query.includes('名字') || query.includes('name')) {
      return '我是你的专属AI助手。'
    } else if (query.includes('天气') || query.includes('weather')) {
      return '今天天气看起来不错！'
    } else if (query.includes('再见') || query.includes('bye')) {
      return '再见！祝你有美好的一天。'
    } else {
      return '我听到了你说：' + query + '。但我还在学习中，可能无法完全理解。'
    }
  }

  return {
    messages,
    inputText,
    isListening,
    isSpeaking,
    startListening,
    sendMessage
  }
}
