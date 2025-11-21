# macOS Desktop Experience in Vue 3

A beautiful and functional macOS desktop simulation built with Vue 3, TypeScript, and Vite.

## Features

### 🖥️ Desktop Environment
- **Realistic Dock**: Animated dock with magnification effect.
- **Menu Bar**: Functional clock, control center, and system menus.
- **Window Management**: Draggable, resizable, and minimizable windows.
- **Context Menu**: Custom right-click menu with system actions.
- **Spotlight Search**: Quick access overlay.
- **Control Center**: Quick toggles for Wi-Fi, Bluetooth, and sliders for Display/Sound.

### 🌐 Internationalization (i18n)
- **Bilingual Support**: Seamless switching between English and Chinese (Simplified).
- **Global State**: Language preference persists across the system (Menu Bar, Apps, Context Menus).

### 📱 Applications

#### 🌤️ Weather
- **Real-time Data**: Fetches current weather conditions.
- **Location Detection**: Automatically detects and displays your city name (using Reverse Geocoding).
- **Dynamic Backgrounds**: Changes based on weather conditions (Sunny, Rainy, Cloudy, etc.).

#### 🎮 Games Center
- **Snake**: Classic snake game.
- **Minesweeper**: Classic puzzle game with flagging support.
- **Tetris**: Fully functional Tetris implementation.

#### 📂 Finder
- Browse through a simulated file system.

## 🛠️ Tech Stack
- **Vue 3** (Composition API, Script Setup)
- **TypeScript**
- **Vite**
- **date-fns** (Time formatting)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ctreyx/macos-desktop.git
   cd macos-desktop
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run development server
   ```bash
   npm run dev
   ```

4. Build for production
   ```bash
   npm run build
   ```

## 📄 License
MIT
