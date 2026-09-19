import {
  JournalEntry,
  TemplateItem,
  StickerItem,
  DualSpace,
  CommentItem,
  SecuritySettings,
} from '../types';

// Pre-built SVG stickers as high-quality data URIs for instant, crisp rendering
export const DEFAULT_STICKERS: StickerItem[] = [
  {
    id: 'stk_coffee',
    name: '温暖拿铁',
    category: 'cute',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23F3E9DD" stroke="%238C6D53" stroke-width="3"/><path d="M30 45 Q50 35 70 45 L65 72 Q50 78 35 72 Z" fill="%23A07855"/><path d="M42 30 Q45 20 48 30" stroke="%238C6D53" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M52 32 Q55 18 58 32" stroke="%238C6D53" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="46" rx="14" ry="5" fill="%23DFD3C3"/></svg>',
  },
  {
    id: 'stk_cat_paw',
    name: '软萌猫爪',
    category: 'cute',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="90" height="90" x="5" y="5" rx="30" fill="%23FFF6F6"/><circle cx="50" cy="62" r="18" fill="%23F7B7B7"/><ellipse cx="32" cy="38" rx="8" ry="12" fill="%23F7B7B7"/><ellipse cx="50" cy="32" rx="8" ry="12" fill="%23F7B7B7"/><ellipse cx="68" cy="38" rx="8" ry="12" fill="%23F7B7B7"/></svg>',
  },
  {
    id: 'stk_tape_green',
    name: '抹茶和纸胶带',
    category: 'tape',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50"><rect x="5" y="10" width="150" height="30" rx="4" fill="%23B3C8B1" opacity="0.85"/><line x1="15" y1="12" x2="15" y2="38" stroke="%238FA88D" stroke-dasharray="3 3"/><line x1="145" y1="12" x2="145" y2="38" stroke="%238FA88D" stroke-dasharray="3 3"/><circle cx="50" cy="25" r="4" fill="%23FFF" opacity="0.6"/><circle cx="90" cy="25" r="4" fill="%23FFF" opacity="0.6"/><circle cx="120" cy="25" r="4" fill="%23FFF" opacity="0.6"/></svg>',
  },
  {
    id: 'stk_tape_kraft',
    name: '暖木撕纸',
    category: 'tape',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 45"><path d="M4 10 L136 10 L134 35 L4 35 Z" fill="%23E5CEB4" opacity="0.9"/><text x="40" y="26" font-family="sans-serif" font-size="11" fill="%237A5C3E" letter-spacing="2">SLOW LIFE</text></svg>',
  },
  {
    id: 'stk_stamp',
    name: '复古日记邮戳',
    category: 'vintage',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="%239B6252" stroke-width="3" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="34" fill="none" stroke="%239B6252" stroke-width="1.5"/><text x="50" y="44" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%239B6252" font-weight="bold">HEALING</text><text x="50" y="58" font-family="sans-serif" font-size="8" text-anchor="middle" fill="%239B6252">TODAY · JOURNAL</text><path d="M25 68 Q50 62 75 68" stroke="%239B6252" stroke-width="2" fill="none"/></svg>',
  },
  {
    id: 'stk_plant',
    name: '治愈尤加利叶',
    category: 'plant',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 85 C50 50 50 20 50 15" stroke="%23587058" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="35" rx="14" ry="9" transform="rotate(-30 38 35)" fill="%239FB89E"/><ellipse cx="62" cy="45" rx="14" ry="9" transform="rotate(25 62 45)" fill="%239FB89E"/><ellipse cx="36" cy="60" rx="15" ry="10" transform="rotate(-20 36 60)" fill="%238CA78A"/><ellipse cx="64" cy="70" rx="15" ry="10" transform="rotate(35 64 70)" fill="%238CA78A"/></svg>',
  },
  {
    id: 'stk_croissant',
    name: '香脆可颂',
    category: 'cute',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 65 Q50 25 80 65 Q65 75 50 68 Q35 75 20 65 Z" fill="%23E5984A" stroke="%23B3671F" stroke-width="2.5"/><path d="M36 48 Q50 36 64 48" stroke="%23B3671F" stroke-width="2" fill="none"/><path d="M42 58 Q50 50 58 58" stroke="%23B3671F" stroke-width="2" fill="none"/></svg>',
  },
  {
    id: 'stk_sun_cloud',
    name: '晴空小云朵',
    category: 'cute',
    createdAt: new Date().toISOString(),
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="68" cy="38" r="18" fill="%23F7CD6B"/><path d="M25 65 Q25 50 40 50 Q46 40 58 44 Q70 42 75 54 Q85 55 82 66 Q80 75 68 75 L35 75 Q25 75 25 65 Z" fill="%23FFFFFF" stroke="%23B0C7D6" stroke-width="2"/></svg>',
  },
];

export const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl_daily',
    title: '今日治愈日常',
    description: '记录今日三件心动小事、天气与午后的一杯温热咖啡。',
    category: 'daily',
    isOfficial: true,
    authorName: '手账研究所',
    authorId: 'system',
    paperStyle: 'grid',
    fontFamily: 'mashan',
    tags: ['日常生活', '小确幸', '慢节奏'],
    sampleTitle: '午后微风与热拿铁 ☕',
    sampleContent: '今天的阳光透过百叶窗洒在地板上，把猫咪晒得暖洋洋的。\n\n🌱 今日三件欣喜小事：\n1. 喝到了一杯坚果香很足的燕麦拿铁\n2. 阳台的罗勒悄悄抽出了嫩绿的新叶\n3. 读完了期待已久的一本治愈绘本\n\n生活不需要每天都轰轰烈烈，平淡安静已足够美好。',
    sampleMood: '☕ 悠闲漫度',
    sampleWeather: '☀️ 晴空万里',
    sampleImages: [
      {
        id: 'img_sample_1',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        caption: '街角转角处的静谧咖啡馆',
      },
    ],
    sampleCollageLayout: 'single',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tpl_food',
    title: '今日三餐与烟火气',
    description: '记录味蕾的感动，无论是一人食还是围坐聚餐。',
    category: 'food',
    isOfficial: true,
    authorName: '手账研究所',
    authorId: 'system',
    paperStyle: 'dots',
    fontFamily: 'kuaile',
    tags: ['美食记录', '私房菜', '深夜食堂'],
    sampleTitle: '幸福就是一顿热气腾腾的晚餐 🍳',
    sampleContent: '• 早餐：煎蛋吐司 + 热黑咖啡\n• 午餐：清爽番茄牛腩饭，汤汁浓郁酸甜\n• 晚餐：自己煮的日式寿喜烧，咕嘟咕嘟的声音超级治愈。\n\n认真吃饭，是给疲惫生活最好的温柔拥抱。',
    sampleMood: '🍳 胃里暖暖',
    sampleWeather: '⛅ 舒爽微阴',
    sampleImages: [
      {
        id: 'img_sample_food',
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        caption: '新鲜出炉的营养沙拉与温食',
      },
    ],
    sampleCollageLayout: 'single',
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'tpl_travel',
    title: '走走停停 · 旅行胶卷',
    description: '多图拼贴排版，把远方的风景与步伐收进小本子。',
    category: 'travel',
    isOfficial: true,
    authorName: '手账研究所',
    authorId: 'system',
    paperStyle: 'kraft',
    fontFamily: 'serif-sc',
    tags: ['旅行手账', '风景', '胶片感'],
    sampleTitle: '在海岛听风看浪花 🌊',
    sampleContent: '搭乘沿海绿皮电车，吹着带着咸味的海风。\n海平线在夕阳下变成了一片橘粉色的渐变，沿途拍下了好多喜欢的瞬间。\n\n脚步所到之处，皆是风景。',
    sampleMood: '🌿 惬意安然',
    sampleWeather: '🌊 海风轻拂',
    sampleImages: [
      {
        id: 'img_sample_travel_1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        caption: '暮色下的海滩',
      },
      {
        id: 'img_sample_travel_2',
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80',
        caption: '森林间的小舟',
      },
    ],
    sampleCollageLayout: 'two-horizontal',
    createdAt: '2026-09-03T10:00:00.000Z',
  },
  {
    id: 'tpl_reading',
    title: '书影摘抄与回甘',
    description: '记录触动心弦的金句、电影台词与个人随想。',
    category: 'reading',
    isOfficial: true,
    authorName: '手账研究所',
    authorId: 'system',
    paperStyle: 'lined',
    fontFamily: 'serif-sc',
    tags: ['读书笔记', '电影清单', '摘录'],
    sampleTitle: '《步履不停》与静水流深 🎬',
    sampleContent: '📖 摘录：“你才三十岁，怎么能说自己的一生已经看得到尽头了呢。”\n\n💬 随想：生活虽然总是充满着“差一点点”的遗憾，但在平凡的生活细节里，那种静默的关怀却从未消逝。今晚重新品味，内心一片柔和。',
    sampleMood: '🌙 晚安好梦',
    sampleWeather: '🌧️ 细雨蒙蒙',
    sampleImages: [],
    sampleCollageLayout: 'single',
    createdAt: '2026-09-04T10:00:00.000Z',
  },
  {
    id: 'tpl_weekly',
    title: '周复盘 · 步履从容',
    description: '梳理一周的心情曲线、完成事项与下周小期待。',
    category: 'weekly',
    isOfficial: true,
    authorName: '手账研究所',
    authorId: 'system',
    paperStyle: 'morandi-green',
    fontFamily: 'default',
    tags: ['周复盘', '日程规划', '自我关怀'],
    sampleTitle: '本周能量补给站 📝',
    sampleContent: '✨ 本周值得嘉奖的自己：\n• 坚持每天早睡了半小时\n• 读完了 1 本小说\n• 尝试做了一道新菜\n\n🎯 下周小期待：\n• 周六去公园看秋叶散步\n• 挑一个下午安静写手账',
    sampleMood: '✨ 元气满满',
    sampleWeather: '🌤️ 晴好宜人',
    sampleImages: [],
    sampleCollageLayout: 'single',
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'tpl_pet',
    title: '毛孩子成长观察日记',
    description: '抓拍萌宠的逗趣瞬间，记录可可爱爱的陪伴日常。',
    category: 'pet',
    isOfficial: true,
    authorName: '手账研究所',
    authorId: 'system',
    paperStyle: 'soft-pink',
    fontFamily: 'kuaile',
    tags: ['猫咪狗狗', '治愈萌宠', '陪伴'],
    sampleTitle: '今天也是被毛孩子治愈的一天 🐾',
    sampleContent: '小猫咪今天又霸占了我的手账本！\n趴在笔记本上打呼噜，尾巴一晃一晃的。\n不管外面有多大的压力，看到这只软乎乎的小生物，心都化了。',
    sampleMood: '🐾 被萌化了',
    sampleWeather: '☀️ 温暖明朗',
    sampleImages: [
      {
        id: 'img_sample_cat',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
        caption: '打瞌睡的橘猫咪咪',
      },
    ],
    sampleCollageLayout: 'single',
    createdAt: '2026-09-06T10:00:00.000Z',
  },
];

export const DEFAULT_JOURNALS: JournalEntry[] = [
  {
    id: 'j_demo_1',
    title: '把日子过成一首慢歌 ☕',
    content: '今天没有赶着出门，清晨煮了一壶热水，看水汽在晨光里蒸腾。\n写下手账的这一刻，时间仿佛慢了下来。\n没有任何排版负担，随手写几行字，贴上喜欢的和纸胶带，生活的小确幸便被温柔定格。',
    fontFamily: 'mashan',
    fontSize: 16,
    lineHeight: 1.8,
    paperStyle: 'grid',
    mood: '☕ 悠闲漫度',
    weather: '☀️ 晴空万里',
    tags: ['晨光', '慢生活', '随笔'],
    createdAt: '2026-09-18T09:30:00.000Z',
    updatedAt: '2026-09-18T09:30:00.000Z',
    images: [
      {
        id: 'img_j1',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        caption: '阳光洒在木桌上',
      },
    ],
    collageLayout: 'single',
    doodleStrokes: [],
    stickers: [
      {
        id: 'stk_p1',
        stickerId: 'stk_coffee',
        url: DEFAULT_STICKERS[0].url,
        x: 82,
        y: 12,
        scale: 1.1,
        rotation: 8,
      },
      {
        id: 'stk_p2',
        stickerId: 'stk_tape_green',
        url: DEFAULT_STICKERS[2].url,
        x: 18,
        y: 6,
        scale: 0.9,
        rotation: -4,
      },
    ],
    schedule: {
      enabled: true,
      startDate: '2026-09-20',
      endDate: '2026-09-20',
      startTime: '15:00',
      endTime: '17:00',
      reminderTimes: ['提前15分钟'],
      tagColor: '#A8BBA2',
    },
    scope: 'personal',
    isDraft: false,
    deletedAt: null,
    authorId: 'user_self',
    authorName: '我',
    allowRecommend: false,
  },
  {
    id: 'j_demo_2',
    title: '窗台边的多肉冒新芽了 🌱',
    content: '照顾了一个夏天的多肉植物，终于在秋天舒展出了嫩粉色的小叶瓣。\n生命总会在不经意间给你带来惊喜。\n今天拍下了照片，做了 AI 抠图小贴纸贴在边上，太可爱了！',
    fontFamily: 'kuaile',
    fontSize: 16,
    lineHeight: 1.8,
    paperStyle: 'dots',
    mood: '🌿 惬意安然',
    weather: '🌤️ 舒爽微阴',
    tags: ['绿植', '阳台花园'],
    createdAt: '2026-09-17T16:20:00.000Z',
    updatedAt: '2026-09-17T16:20:00.000Z',
    images: [
      {
        id: 'img_j2',
        url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&auto=format&fit=crop&q=80',
        caption: '晶莹剔透的多肉',
      },
    ],
    collageLayout: 'single',
    doodleStrokes: [],
    stickers: [
      {
        id: 'stk_p3',
        stickerId: 'stk_plant',
        url: DEFAULT_STICKERS[5].url,
        x: 78,
        y: 75,
        scale: 1.2,
        rotation: 12,
      },
    ],
    scope: 'personal',
    isDraft: false,
    deletedAt: null,
    authorId: 'user_self',
    authorName: '我',
    allowRecommend: false,
  },
  {
    id: 'j_demo_shared_1',
    title: '属于我们的周末野餐记忆 🧺',
    content: '我们在草坪上铺开了红白格子的野餐垫，带来了自己烤的香蕉面包和新鲜草莓。\n微风轻轻吹过树梢，树影斑驳。\n这是只属于两个人的静谧回忆空间，任意一方修改或添加评论，我们都能默默读懂对方的心意。',
    fontFamily: 'serif-sc',
    fontSize: 16,
    lineHeight: 1.8,
    paperStyle: 'kraft',
    mood: '☀️ 心满意足',
    weather: '☀️ 晴空万里',
    tags: ['双人时光', '野餐', '回忆'],
    createdAt: '2026-09-16T14:10:00.000Z',
    updatedAt: '2026-09-16T14:10:00.000Z',
    images: [
      {
        id: 'img_j_shared',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        originalUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        caption: '草坪上的野餐篮',
      },
    ],
    collageLayout: 'single',
    doodleStrokes: [],
    stickers: [
      {
        id: 'stk_p4',
        stickerId: 'stk_cat_paw',
        url: DEFAULT_STICKERS[1].url,
        x: 80,
        y: 80,
        scale: 1.0,
        rotation: -5,
      },
    ],
    scope: 'shared',
    spaceId: 'space_demo_1',
    isDraft: false,
    deletedAt: null,
    authorId: 'user_self',
    authorName: '我',
    allowRecommend: false,
  },
];

export const DEFAULT_DUAL_SPACES: DualSpace[] = [
  {
    id: 'space_demo_1',
    name: '两颗小松果的秘密树洞 🌰',
    description: '两个人都是主人。专属手账同步留存，随时留下悄悄话。',
    creatorId: 'user_self',
    creatorName: '我',
    partnerId: 'user_partner_1',
    partnerName: '小暖',
    code: 'WARM-2026',
    coverColor: '#D3A29D',
    createdAt: '2026-09-10T12:00:00.000Z',
    isDisbanded: false,
    unreadCount: 1,
  },
];

export const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 'cmt_1',
    journalId: 'j_demo_shared_1',
    spaceId: 'space_demo_1',
    authorId: 'user_partner_1',
    authorName: '小暖',
    text: '草莓超级甜！下次还要一起去那个湖畔公园看日落呀 🍓',
    createdAt: '2026-09-16T15:30:00.000Z',
  },
];

// LocalStorage Keys
const KEYS = {
  JOURNALS: 'healing_journal_entries',
  TEMPLATES: 'healing_journal_templates',
  STICKERS: 'healing_journal_stickers',
  SPACES: 'healing_journal_spaces',
  COMMENTS: 'healing_journal_comments',
  SECURITY: 'healing_journal_security',
};

// Auto-clean recycle bin older than 7 days
function filterExpiredRecycleBin(entries: JournalEntry[]): JournalEntry[] {
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return entries.filter((item) => {
    if (!item.deletedAt) return true;
    const deletedTime = new Date(item.deletedAt).getTime();
    return now - deletedTime < SEVEN_DAYS_MS;
  });
}

export const StorageService = {
  getJournals(includeDeleted = false): JournalEntry[] {
    try {
      const raw = localStorage.getItem(KEYS.JOURNALS);
      let list: JournalEntry[] = raw ? JSON.parse(raw) : DEFAULT_JOURNALS;
      // Auto purge expired items in recycle bin
      const cleaned = filterExpiredRecycleBin(list);
      if (cleaned.length !== list.length) {
        localStorage.setItem(KEYS.JOURNALS, JSON.stringify(cleaned));
        list = cleaned;
      }
      if (includeDeleted) {
        return list;
      }
      return list.filter((j) => !j.deletedAt && !j.isDraft);
    } catch {
      return DEFAULT_JOURNALS;
    }
  },

  saveJournal(entry: JournalEntry): void {
    const list = this.getJournals(true);
    const existingIndex = list.findIndex((j) => j.id === entry.id);
    let updated: JournalEntry[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...entry, createdAt: entry.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }, ...list];
    }
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(updated));
  },

  deleteJournal(id: string): void {
    const list = this.getJournals(true);
    const updated = list.map((j) => {
      if (j.id === id) {
        return { ...j, deletedAt: new Date().toISOString() };
      }
      return j;
    });
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(updated));
  },

  restoreJournal(id: string): void {
    const list = this.getJournals(true);
    const updated = list.map((j) => {
      if (j.id === id) {
        return { ...j, deletedAt: null };
      }
      return j;
    });
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(updated));
  },

  permanentlyDelete(id: string): void {
    const list = this.getJournals(true);
    const updated = list.filter((j) => j.id !== id);
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(updated));
  },

  emptyRecycleBin(): void {
    const list = this.getJournals(true);
    const updated = list.filter((j) => !j.deletedAt);
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(updated));
  },

  getRecycleBin(): { entry: JournalEntry; daysLeft: number }[] {
    const list = this.getJournals(true);
    const deleted = list.filter((j) => !!j.deletedAt);
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    return deleted
      .map((entry) => {
        const deletedTime = new Date(entry.deletedAt!).getTime();
        const diff = SEVEN_DAYS_MS - (now - deletedTime);
        const daysLeft = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
        return { entry, daysLeft };
      })
      .filter((item) => item.daysLeft > 0);
  },

  // Drafts
  getDrafts(): JournalEntry[] {
    const list = this.getJournals(true);
    return list.filter((j) => j.isDraft && !j.deletedAt);
  },

  saveDraft(draft: JournalEntry): void {
    this.saveJournal({ ...draft, isDraft: true });
  },

  deleteDraft(id: string): void {
    this.permanentlyDelete(id);
  },

  // Templates
  getTemplates(): TemplateItem[] {
    try {
      const raw = localStorage.getItem(KEYS.TEMPLATES);
      const list: TemplateItem[] = raw ? JSON.parse(raw) : DEFAULT_TEMPLATES;
      return list.filter((t) => !t.reported);
    } catch {
      return DEFAULT_TEMPLATES;
    }
  },

  saveTemplate(tpl: TemplateItem): void {
    const list = this.getTemplates();
    const existingIndex = list.findIndex((t) => t.id === tpl.id);
    let updated: TemplateItem[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = tpl;
    } else {
      updated = [tpl, ...list];
    }
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(updated));
  },

  reportTemplate(id: string): void {
    const list = this.getTemplates();
    const updated = list.map((t) => (t.id === id ? { ...t, reported: true } : t));
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(updated));
  },

  // Stickers
  getStickers(): StickerItem[] {
    try {
      const raw = localStorage.getItem(KEYS.STICKERS);
      const custom: StickerItem[] = raw ? JSON.parse(raw) : [];
      return [...DEFAULT_STICKERS, ...custom];
    } catch {
      return DEFAULT_STICKERS;
    }
  },

  saveCustomSticker(sticker: StickerItem): void {
    try {
      const raw = localStorage.getItem(KEYS.STICKERS);
      const custom: StickerItem[] = raw ? JSON.parse(raw) : [];
      const updated = [sticker, ...custom];
      localStorage.setItem(KEYS.STICKERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage limit reached when saving sticker', e);
    }
  },

  deleteCustomSticker(id: string): void {
    try {
      const raw = localStorage.getItem(KEYS.STICKERS);
      const custom: StickerItem[] = raw ? JSON.parse(raw) : [];
      const updated = custom.filter((s) => s.id !== id);
      localStorage.setItem(KEYS.STICKERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Sticker deletion error', e);
    }
  },

  // Dual Spaces
  getDualSpaces(): DualSpace[] {
    try {
      const raw = localStorage.getItem(KEYS.SPACES);
      return raw ? JSON.parse(raw) : DEFAULT_DUAL_SPACES;
    } catch {
      return DEFAULT_DUAL_SPACES;
    }
  },

  saveDualSpace(space: DualSpace): void {
    const spaces = this.getDualSpaces();
    const existingIdx = spaces.findIndex((s) => s.id === space.id);
    let updated: DualSpace[];
    if (existingIdx >= 0) {
      updated = [...spaces];
      updated[existingIdx] = space;
    } else {
      updated = [space, ...spaces];
    }
    localStorage.setItem(KEYS.SPACES, JSON.stringify(updated));
  },

  disbandDualSpace(id: string): void {
    const spaces = this.getDualSpaces();
    const updated = spaces.map((s) => (s.id === id ? { ...s, isDisbanded: true } : s));
    localStorage.setItem(KEYS.SPACES, JSON.stringify(updated));
  },

  // Comments in Dual Spaces
  getComments(journalId?: string): CommentItem[] {
    try {
      const raw = localStorage.getItem(KEYS.COMMENTS);
      const list: CommentItem[] = raw ? JSON.parse(raw) : DEFAULT_COMMENTS;
      if (journalId) {
        return list.filter((c) => c.journalId === journalId);
      }
      return list;
    } catch {
      return DEFAULT_COMMENTS;
    }
  },

  addComment(comment: CommentItem): void {
    const list = this.getComments();
    const updated = [...list, comment];
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(updated));
  },

  deleteComment(commentId: string): void {
    const list = this.getComments();
    const updated = list.filter((c) => c.id !== commentId);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(updated));
  },

  // Security & Privacy Settings
  getSecuritySettings(): SecuritySettings {
    try {
      const raw = localStorage.getItem(KEYS.SECURITY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        isLocked: parsed?.isLocked || false,
        pinCode: parsed?.pinCode || parsed?.passcode || '',
        biometricEnabled: parsed?.biometricEnabled || false,
        allowRecommend: false,
        appLockEnabled: parsed?.appLockEnabled ?? parsed?.isLocked ?? false,
        hasPasscode: Boolean(parsed?.hasPasscode || parsed?.pinCode || parsed?.passcode),
        passcode: parsed?.passcode || parsed?.pinCode || '',
      };
    } catch {
      return {
        isLocked: false,
        pinCode: '',
        biometricEnabled: false,
        allowRecommend: false,
        appLockEnabled: false,
        hasPasscode: false,
        passcode: '',
      };
    }
  },

  saveSecuritySettings(settings: SecuritySettings): void {
    localStorage.setItem(KEYS.SECURITY, JSON.stringify(settings));
  },

  getRecycledJournals(): JournalEntry[] {
    const list = this.getJournals(true);
    return list.filter((j) => !!j.deletedAt);
  },

  permanentDeleteJournal(id: string): void {
    this.permanentlyDelete(id);
  },

  deleteSticker(id: string): void {
    this.deleteCustomSticker(id);
  },

  exportAllData(): string {
    return this.exportJournalsData().json;
  },

  exportJournalsData(): {
    json: string;
    totalCount: number;
    activeCount: number;
    draftCount: number;
    recycledCount: number;
    stickersCount: number;
    spacesCount: number;
    sizeKb: number;
    fileName: string;
  } {
    const all = this.getJournals(true);
    const active = all.filter((j) => !j.deletedAt && !j.isDraft);
    const drafts = all.filter((j) => j.isDraft && !j.deletedAt);
    const recycled = all.filter((j) => !!j.deletedAt);
    const stickers = this.getStickers();
    const spaces = this.getDualSpaces();
    const templates = this.getTemplates();
    const comments = this.getComments();
    const security = this.getSecuritySettings();

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().slice(0, 10);
    const timeStr = timestamp.toTimeString().slice(0, 5).replace(':', '');
    const fileName = `healing-journal-backup-${dateStr}_${timeStr}.json`;

    const payload = {
      appName: '极简治愈手账',
      type: 'healing_journal_backup',
      version: '1.2.0',
      exportedAt: timestamp.toISOString(),
      metadata: {
        totalJournals: all.length,
        activeJournals: active.length,
        drafts: drafts.length,
        recycled: recycled.length,
        stickersCount: stickers.length,
        spacesCount: spaces.length,
        dataOwnership: '自主离线备份，100% 用户所有，无任何加密与限制',
      },
      journals: all,
      stickers,
      spaces,
      comments,
      templates,
      security: {
        appLockEnabled: security.appLockEnabled || false,
        biometricEnabled: security.biometricEnabled || false,
      },
    };

    const json = JSON.stringify(payload, null, 2);
    const sizeKb = Math.round((new Blob([json]).size / 1024) * 10) / 10;

    return {
      json,
      totalCount: all.length,
      activeCount: active.length,
      draftCount: drafts.length,
      recycledCount: recycled.length,
      stickersCount: stickers.length,
      spacesCount: spaces.length,
      sizeKb,
      fileName,
    };
  },

  importData(jsonString: string): { success: boolean; count?: number; message?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      let journalsList: JournalEntry[] | null = null;

      if (Array.isArray(parsed)) {
        journalsList = parsed;
      } else if (parsed && Array.isArray(parsed.journals)) {
        journalsList = parsed.journals;
      }

      if (journalsList && journalsList.length >= 0) {
        localStorage.setItem(KEYS.JOURNALS, JSON.stringify(journalsList));
      }

      if (parsed && !Array.isArray(parsed)) {
        if (parsed.templates && Array.isArray(parsed.templates)) {
          localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(parsed.templates));
        }
        if (parsed.stickers && Array.isArray(parsed.stickers)) {
          localStorage.setItem(KEYS.STICKERS, JSON.stringify(parsed.stickers));
        }
        if (parsed.spaces && Array.isArray(parsed.spaces)) {
          localStorage.setItem(KEYS.SPACES, JSON.stringify(parsed.spaces));
        }
        if (parsed.comments && Array.isArray(parsed.comments)) {
          localStorage.setItem(KEYS.COMMENTS, JSON.stringify(parsed.comments));
        }
      }

      if (journalsList) {
        return { success: true, count: journalsList.length };
      }
      return { success: false, message: '备份文件中未找到手账列表' };
    } catch (e) {
      console.error('Import failed', e);
      return { success: false, message: 'JSON 数据格式有误' };
    }
  },
};
