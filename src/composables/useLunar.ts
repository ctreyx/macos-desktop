// 简易农历与节气计算工具
// 注意：这是一个简化版本，主要用于演示。精确的农历算法非常复杂。

// 节气常量
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
]

// 节气大致日期（基于公历，会有1-2天误差，这里使用简化查表法优化常见年份）
// 这是一个简化的映射，实际节气计算需要天文算法
const TERM_INFO = {
  1: [5, 20], 2: [3, 18], 3: [5, 20], 4: [4, 19], 5: [5, 20], 6: [5, 21],
  7: [6, 22], 8: [7, 22], 9: [7, 22], 10: [8, 23], 11: [7, 22], 12: [7, 21]
}

// 公历节日
const SOLAR_FESTIVALS: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节'
}

// 农历节日 (月-日)
const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '2-2': '龙抬头',
  '5-5': '端午节',
  '7-7': '七夕节',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-23': '小年'
}

export function useLunar() {
  // 获取农历日期字符串 (例如: "五月二十")
  const getLunarDateString = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  // 解析 Intl 返回的农历字符串为数字 (例如 "五月二十" -> {month: 5, day: 20})
  // 注意：Intl 返回格式可能因浏览器而异，这里做一个简单的解析适配
  const parseLunarDate = (lunarStr: string) => {
    // 移除 "年" 以前的部分（如果有）
    const cleanStr = lunarStr.replace(/.*?年/, '')
    
    const monthMap: Record<string, number> = {
      '正月': 1, '一月': 1, '二月': 2, '三月': 3, '四月': 4, '五月': 5, '六月': 6,
      '七月': 7, '八月': 8, '九月': 9, '十月': 10, '十一月': 11, '冬月': 11, '十二月': 12, '腊月': 12
    }
    
    let month = 0
    let day = 0

    // 简单匹配月份
    for (const m in monthMap) {
      if (cleanStr.includes(m)) {
        month = monthMap[m]
        break
      }
    }

    // 简单匹配日期 (初一到三十)
    const dayStr = cleanStr.match(/[初十廿三][一二三四五六七八九十]/)
    if (dayStr) {
      const d = dayStr[0]
      const prefix = d[0]
      const suffix = d[1]
      
      if (prefix === '初') day = 0
      else if (prefix === '十') day = 10
      else if (prefix === '廿') day = 20
      else if (prefix === '三') day = 30 // 三十

      const digitMap: Record<string, number> = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
      }
      
      if (prefix === '十' && suffix !== '日') {
          // 十一, 十二...
          day = 10 + (digitMap[suffix] || 0)
      } else if (prefix === '三' && suffix === '十') {
          day = 30
      } else {
          day += digitMap[suffix] || 0
      }
    } else {
        // 尝试匹配数字 (有些环境返回 5月20日)
        const match = cleanStr.match(/(\d+)月(\d+)/)
        if (match) {
            month = parseInt(match[1])
            day = parseInt(match[2])
        }
    }

    return { month, day }
  }

  const getFestival = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 1. 检查公历节日
    const solarKey = `${month}-${day}`
    if (SOLAR_FESTIVALS[solarKey]) {
      return SOLAR_FESTIVALS[solarKey]
    }

    // 2. 检查农历节日
    const lunarStr = getLunarDateString(date)
    const { month: lMonth, day: lDay } = parseLunarDate(lunarStr)
    
    if (lMonth > 0 && lDay > 0) {
      const lunarKey = `${lMonth}-${lDay}`
      if (LUNAR_FESTIVALS[lunarKey]) {
        return LUNAR_FESTIVALS[lunarKey]
      }
      
      // 除夕判断 (简单判断：如果是腊月且是最后一天)
      // 这里简化处理，暂不精确计算除夕，因为需要知道下个月初一
    }

    // 3. 检查节气 (简化版，仅根据日期范围估算)
    // 这是一个非常粗略的估算，仅用于演示
    // 实际节气计算需要复杂的天文公式
    const termDates = TERM_INFO[month as keyof typeof TERM_INFO]
    if (termDates) {
      if (Math.abs(day - termDates[0]) <= 1) {
        // 简单映射，不精确
        const termIndex = (month - 1) * 2
        return SOLAR_TERMS[termIndex]
      }
      if (Math.abs(day - termDates[1]) <= 1) {
        const termIndex = (month - 1) * 2 + 1
        return SOLAR_TERMS[termIndex]
      }
    }

    return ''
  }

  const getLunarDayText = (date: Date) => {
    const lunarStr = getLunarDateString(date)
    // 提取 "初一", "十五" 等部分
    // 现代浏览器 Intl API 返回如 "2024甲辰年五月二十"
    // 我们尝试提取最后两个字作为日期显示，如果是初一则显示月份
    
    // 简单处理：直接返回 Intl 格式化后的最后部分
    // 实际项目中建议使用 'lunar-javascript' 库
    const parts = lunarStr.split('月')
    if (parts.length > 1) {
        const dayPart = parts[1].replace('日', '')
        // 如果是初一，返回月份
        if (dayPart === '初一') {
            return parts[0].split('年').pop() + '月'
        }
        return dayPart
    }
    return ''
  }

  return {
    getFestival,
    getLunarDayText
  }
}
