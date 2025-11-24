import { ref } from 'vue'

const currentLang = ref<'en' | 'zh'>('en')

const translations = {
  en: {
    system: {
      finder: 'Finder',
      safari: 'Safari',
      messages: 'Messages',
      mail: 'Mail',
      maps: 'Maps',
      photos: 'Photos',
      games: 'Game Center',
      weather: 'Weather',
      settings: 'Settings',
      trash: 'Trash',
      launchpad: 'Launchpad'
    },
    menu: {
      apple: 'Apple',
      file: 'File',
      edit: 'Edit',
      view: 'View',
      go: 'Go',
      window: 'Window',
      help: 'Help',
      about: 'About This Mac',
      sleep: 'Sleep',
      restart: 'Restart',
      shutdown: 'Shut Down',
      lock: 'Lock Screen',
      logout: 'Log Out',
      switchLang: 'Switch to Chinese'
    },
    weather: {
      loading: 'Loading Weather...',
      error: 'Failed to fetch weather data',
      retry: 'Retry',
      locating: 'Locating...',
      wind: 'WIND',
      direction: 'DIRECTION',
      humidity: 'HUMIDITY',
      feelsLike: 'FEELS LIKE',
      today: 'Today',
      unknown: 'Unknown'
    },
    games: {
      title: 'Game Center',
      score: 'Score',
      back: 'Back',
      restart: 'Restart',
      quit: 'Quit',
      gameOver: 'Game Over',
      youWon: 'You Won!',
      snake: 'Snake',
      minesweeper: 'Minesweeper',
      tetris: 'Tetris',
      snakeDesc: 'Classic Snake Game',
      mineDesc: 'Find mines without exploding',
      tetrisDesc: 'Stack blocks and clear lines',
      controls: 'Controls',
      pause: 'Pause'
    },
    context: {
      newFolder: 'New Folder',
      getInfo: 'Get Info',
      changeBg: 'Change Desktop Background...',
      useStacks: 'Use Stacks',
      sortBy: 'Sort By',
      cleanUp: 'Clean Up',
      cleanUpBy: 'Clean Up By',
      showViewOptions: 'Show View Options'
    },
    settings: {
      title: 'Settings',
      general: 'General',
      wallpaper: 'Wallpaper',
      display: 'Display',
      desktopWallpaper: 'Desktop Wallpaper',
      currentDesktop: 'Current Desktop',
      defaultWallpapers: 'Default Wallpapers',
      customWallpaper: 'Custom Wallpaper',
      uploadImage: 'Upload Image',
      supportedFormats: 'Supported formats: JPG, PNG, WebP',
      settings: 'Settings',
      underConstruction: 'This section is under construction.'
    },
    maps: {
      search: 'Search location...',
      navigation: 'Navigation',
      start: 'Start Point',
      end: 'End Point',
      go: 'Go',
      duration: 'Duration',
      distance: 'Distance',
      instructions: 'Instructions'
    },
    safari: {
      search: 'Search or enter website name',
      back: 'Back',
      forward: 'Forward',
      refresh: 'Refresh'
    }
  },
  zh: {
    system: {
      finder: '访达',
      safari: 'Safari浏览器',
      messages: '信息',
      mail: '邮件',
      maps: '地图',
      photos: '照片',
      games: '游戏中心',
      weather: '天气',
      settings: '设置',
      trash: '废纸篓',
      launchpad: '启动台'
    },
    menu: {
      apple: '苹果',
      file: '文件',
      edit: '编辑',
      view: '视图',
      go: '前往',
      window: '窗口',
      help: '帮助',
      about: '关于本机',
      sleep: '睡眠',
      restart: '重新启动',
      shutdown: '关机',
      lock: '锁定屏幕',
      logout: '退出登录',
      switchLang: '切换到英文'
    },
    weather: {
      loading: '正在加载天气...',
      error: '获取天气数据失败',
      retry: '重试',
      locating: '定位中...',
      wind: '风速',
      direction: '风向',
      humidity: '湿度',
      feelsLike: '体感温度',
      today: '今天',
      unknown: '未知'
    },
    games: {
      title: '游戏中心',
      score: '得分',
      back: '返回',
      restart: '重新开始',
      quit: '退出',
      gameOver: '游戏结束',
      youWon: '你赢了！',
      snake: '贪吃蛇',
      minesweeper: '扫雷',
      tetris: '俄罗斯方块',
      snakeDesc: '经典贪吃蛇游戏',
      mineDesc: '寻找地雷',
      tetrisDesc: '堆叠方块并消除',
      controls: '控制',
      pause: '暂停'
    },
    context: {
      newFolder: '新建文件夹',
      getInfo: '显示简介',
      changeBg: '更改桌面背景...',
      useStacks: '使用叠放',
      sortBy: '排序方式',
      cleanUp: '整理',
      cleanUpBy: '整理方式',
      showViewOptions: '查看显示选项'
    },
    settings: {
      title: '设置',
      general: '通用',
      wallpaper: '壁纸',
      display: '显示器',
      desktopWallpaper: '桌面壁纸',
      currentDesktop: '当前桌面',
      defaultWallpapers: '默认壁纸',
      customWallpaper: '自定义壁纸',
      uploadImage: '上传图片',
      supportedFormats: '支持格式：JPG, PNG, WebP',
      settings: '设置',
      underConstruction: '该部分正在建设中。'
    },
    maps: {
      search: '搜索地点...',
      navigation: '导航',
      start: '起点',
      end: '终点',
      go: '出发',
      duration: '时间',
      distance: '距离',
      instructions: '路线指引'
    },
    safari: {
      search: '搜索或输入网站名称',
      back: '后退',
      forward: '前进',
      refresh: '刷新'
    }
  }
}

export function useI18n() {
  const t = (path: string) => {
    const keys = path.split('.')
    let value: any = translations[currentLang.value]
    for (const key of keys) {
      if (value && value[key]) {
        value = value[key]
      } else {
        return path
      }
    }
    return value
  }

  const toggleLang = () => {
    currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
  }

  return {
    currentLang,
    t,
    toggleLang
  }
}
