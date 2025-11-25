import { ref } from 'vue'

const savedLang = localStorage.getItem('language') as 'en' | 'zh'
const currentLang = ref<'en' | 'zh'>(savedLang || 'en')

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
      chatbot: 'AI Assistant',
      calendar: 'Calendar',
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
      walk: 'Walk',
      cycle: 'Bike',
      drive: 'Drive',
      duration: 'Duration',
      distance: 'Distance',
      instructions: 'Instructions',
      directions: 'Directions',
      done: 'Done',
      estTime: 'Est. Time',
  arrivalTime: 'Arrival',
  min: 'min',
  hr: 'hr',
      selectDest: 'Select a destination on the map',
      calculating: 'Calculating...',
      myLocation: 'My Location',
      locateMe: 'Locate Me',
      favorites: 'Favorites',
      guides: 'Guides',
      cityGuide: 'City Guide',
      home: 'Home',
      work: 'Work',
      updatedAt: 'Updated at'
    },
    safari: {
      search: 'Search or enter website name',
      back: 'Back',
      forward: 'Forward',
      refresh: 'Refresh'
    },
    calendar: {
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      home: 'Home',
      work: 'Work',
      family: 'Family',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      today: 'Today'
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
      chatbot: 'AI助手',
      calendar: '日历',
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
      walk: '步行',
      cycle: '骑行',
      drive: '开车',
      duration: '时间',
      distance: '距离',
      instructions: '路线指引',
      directions: '路线',
      done: '完成',
      estTime: '预计时间',
  arrivalTime: '到达时间',
  min: '分钟',
  hr: '小时',
      selectDest: '在地图上选择终点',
      calculating: '计算中...',
      myLocation: '我的位置',
      locateMe: '定位我',
      favorites: '收藏',
      guides: '指南',
      cityGuide: '城市指南',
      home: '家',
      work: '公司',
      updatedAt: '更新于'
    },
    safari: {
      search: '搜索或输入网站名称',
      back: '后退',
      forward: '前进',
      refresh: '刷新'
    },
    calendar: {
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      home: '家庭',
      work: '工作',
      family: '家人',
      month: '月',
      week: '周',
      day: '日',
      today: '今天'
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
    localStorage.setItem('language', currentLang.value)
  }

  return {
    currentLang,
    t,
    toggleLang
  }
}
