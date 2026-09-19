export type PaperStyle = 'blank' | 'grid' | 'dots' | 'lined' | 'kraft' | 'morandi-green' | 'soft-pink';

export type JournalFont = 'default' | 'mashan' | 'kuaile' | 'longcang' | 'serif-sc' | 'caveat';

export interface JournalImage {
  id: string;
  url: string;
  originalUrl: string;
  caption?: string;
  cropAspect?: string;
  doodleOverlay?: string; // base64 doodle overlay specifically on this image
}

export type CollageLayout = 'single' | 'two-vertical' | 'two-horizontal' | 'three-grid' | 'polaroid-quad' | 'filmstrip';

export interface DoodleStroke {
  color: string;
  width: number;
  opacity: number;
  isEraser: boolean;
  points: { x: number; y: number }[];
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  url: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  scale: number; // default 1
  rotation: number; // in degrees
  flipped?: boolean;
}

export interface ScheduleConfig {
  enabled: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reminderTimes: string[]; // e.g. ['准时提醒', '提前15分钟', '提前1天']
  tagColor: string; // Morandi color dot
}

export interface CommentItem {
  id: string;
  journalId: string;
  spaceId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  fontFamily: JournalFont;
  fontSize: number; // 14 to 22
  lineHeight: number; // 1.5 to 2.2
  paperStyle: PaperStyle;
  mood: string;
  weather: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  images: JournalImage[];
  collageLayout: CollageLayout;
  doodleStrokes: DoodleStroke[];
  stickers: PlacedSticker[];
  schedule?: ScheduleConfig;
  scope: 'personal' | 'shared';
  spaceId?: string;
  isDraft: boolean;
  deletedAt: string | null; // ISO string if in recycle bin, null if active
  authorId: string;
  authorName: string;
  allowRecommend?: boolean;
}

export interface StickerItem {
  id: string;
  name: string;
  url: string;
  category: 'cute' | 'vintage' | 'tape' | 'plant' | 'custom';
  isCustom?: boolean;
  createdAt: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'food' | 'travel' | 'reading' | 'weekly' | 'mood' | 'pet';
  isOfficial: boolean;
  authorName: string;
  authorId: string;
  paperStyle: PaperStyle;
  fontFamily: JournalFont;
  tags: string[];
  sampleTitle: string;
  sampleContent: string;
  sampleMood: string;
  sampleWeather: string;
  sampleImages: JournalImage[];
  sampleCollageLayout: CollageLayout;
  reported?: boolean;
  createdAt: string;
}

export interface DualSpace {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  partnerId: string;
  partnerName: string;
  code: string;
  coverColor: string;
  createdAt: string;
  isDisbanded: boolean;
  unreadCount?: number;
}

export interface SecuritySettings {
  isLocked: boolean;
  pinCode: string; // 4-digit PIN
  biometricEnabled: boolean;
  allowRecommend: boolean; // default false
  appLockEnabled?: boolean;
  hasPasscode?: boolean;
  passcode?: string;
}
