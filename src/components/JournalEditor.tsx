import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  PenTool,
  Sparkles,
  Calendar,
  Layers,
  Type,
  Smile,
  Cloud,
  Bookmark,
  Share2,
  Check,
  Tag,
  Clock,
  Palette,
  AlertCircle,
} from 'lucide-react';
import {
  JournalEntry,
  PaperStyle,
  JournalFont,
  JournalImage,
  CollageLayout,
  DoodleStroke,
  PlacedSticker,
  ScheduleConfig,
  StickerItem,
  DualSpace,
  TemplateItem,
} from '../types';
import { StorageService } from '../utils/storage';
import { CollageEditor } from './CollageEditor';
import { HandwritingOverlay } from './HandwritingOverlay';
import { StickerLayer } from './StickerLayer';
import { StickerStudioModal } from './StickerStudioModal';

interface JournalEditorProps {
  initialEntry?: JournalEntry | null;
  initialTemplate?: TemplateItem | null;
  onClose: () => void;
  onSaveSuccess: (entry: JournalEntry) => void;
}

const PAPER_STYLES: { id: PaperStyle; name: string; bgClass: string; color: string }[] = [
  { id: 'blank', name: '素白', bgClass: 'bg-white', color: '#FFFFFF' },
  { id: 'grid', name: '方格', bgClass: 'bg-[#FBF9F5] paper-grid', color: '#FBF9F5' },
  { id: 'dots', name: '点阵', bgClass: 'bg-[#FAF8F5] paper-dots', color: '#FAF8F5' },
  { id: 'lined', name: '横线', bgClass: 'bg-[#FCFAF6] paper-lined', color: '#FCFAF6' },
  { id: 'kraft', name: '牛皮', bgClass: 'bg-[#F3E7D7]', color: '#F3E7D7' },
  { id: 'morandi-green', name: '草木', bgClass: 'bg-[#EFF3EE]', color: '#EFF3EE' },
  { id: 'soft-pink', name: '暖杏', bgClass: 'bg-[#FAF1EC]', color: '#FAF1EC' },
];

const FONTS: { id: JournalFont; name: string; fontClass: string }[] = [
  { id: 'default', name: '极简黑体', fontClass: 'font-sans' },
  { id: 'mashan', name: '优雅行楷', fontClass: 'font-mashan' },
  { id: 'kuaile', name: '暖心圆体', fontClass: 'font-kuaile' },
  { id: 'longcang', name: '随性写意', fontClass: 'font-longcang' },
  { id: 'serif-sc', name: '文艺宋体', fontClass: 'font-serif-sc' },
  { id: 'caveat', name: '英文字体', fontClass: 'font-caveat' },
];

const MOODS = [
  '☀️ 晴朗小确幸',
  '☕ 悠闲漫度',
  '🌿 惬意安然',
  '🌙 晚安好梦',
  '🌧️ 听雨发呆',
  '🍳 胃里暖暖',
  '🐾 被萌化了',
  '✨ 元气满满',
  '📖 沉浸回味',
];

const WEATHERS = ['☀️ 晴天', '⛅ 多云', '🌧️ 细雨', '🌬️ 微风', '❄️ 初雪'];

const SCHEDULE_DOT_COLORS = ['#A8BBA2', '#E2A988', '#98B4D4', '#D4A5A5', '#B8A99A'];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  initialEntry,
  initialTemplate,
  onClose,
  onSaveSuccess,
}) => {
  // Determine starting state
  const isEditingExisting = !!initialEntry && !initialEntry.isDraft;
  const entryId = useRef<string>(initialEntry?.id || `j_${Date.now()}`).current;

  const [title, setTitle] = useState<string>(
    initialEntry?.title || initialTemplate?.sampleTitle || ''
  );
  const [content, setContent] = useState<string>(
    initialEntry?.content || initialTemplate?.sampleContent || ''
  );
  const [paperStyle, setPaperStyle] = useState<PaperStyle>(
    initialEntry?.paperStyle || initialTemplate?.paperStyle || 'grid'
  );
  const [fontFamily, setFontFamily] = useState<JournalFont>(
    initialEntry?.fontFamily || initialTemplate?.fontFamily || 'mashan'
  );
  const [fontSize, setFontSize] = useState<number>(initialEntry?.fontSize || 16);
  const [mood, setMood] = useState<string>(
    initialEntry?.mood || initialTemplate?.sampleMood || MOODS[0]
  );
  const [weather, setWeather] = useState<string>(
    initialEntry?.weather || initialTemplate?.sampleWeather || WEATHERS[0]
  );
  const [images, setImages] = useState<JournalImage[]>(
    initialEntry?.images || initialTemplate?.sampleImages || []
  );
  const [collageLayout, setCollageLayout] = useState<CollageLayout>(
    initialEntry?.collageLayout || initialTemplate?.sampleCollageLayout || 'single'
  );
  const [doodleStrokes, setDoodleStrokes] = useState<DoodleStroke[]>(
    initialEntry?.doodleStrokes || []
  );
  const [stickers, setStickers] = useState<PlacedSticker[]>(
    initialEntry?.stickers || []
  );
  const [scope, setScope] = useState<'personal' | 'shared'>(
    initialEntry?.scope || 'personal'
  );
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    initialEntry?.spaceId || ''
  );

  // Schedule linkage
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(
    initialEntry?.schedule?.enabled || false
  );
  const [scheduleStartDate, setScheduleStartDate] = useState<string>(
    initialEntry?.schedule?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [scheduleEndDate, setScheduleEndDate] = useState<string>(
    initialEntry?.schedule?.endDate || new Date().toISOString().slice(0, 10)
  );
  const [scheduleStartTime, setScheduleStartTime] = useState<string>(
    initialEntry?.schedule?.startTime || '09:00'
  );
  const [scheduleEndTime, setScheduleEndTime] = useState<string>(
    initialEntry?.schedule?.endTime || '10:00'
  );
  const [scheduleDotColor, setScheduleDotColor] = useState<string>(
    initialEntry?.schedule?.tagColor || SCHEDULE_DOT_COLORS[0]
  );

  // UI state
  const [isHandwritingActive, setIsHandwritingActive] = useState<boolean>(false);
  const [showStickerStudio, setShowStickerStudio] = useState<boolean>(false);
  const [showStickerPicker, setShowStickerPicker] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showMoodPicker, setShowMoodPicker] = useState<boolean>(false);
  const [availableStickers, setAvailableStickers] = useState<StickerItem[]>([]);
  const [dualSpaces, setDualSpaces] = useState<DualSpace[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const paperContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load stickers and dual spaces
  useEffect(() => {
    setAvailableStickers(StorageService.getStickers());
    const spaces = StorageService.getDualSpaces();
    setDualSpaces(spaces);
    if (spaces.length > 0 && !selectedSpaceId) {
      setSelectedSpaceId(spaces[0].id);
    }
  }, []);

  // Construct current journal object
  const getCurrentJournalData = (isDraft: boolean): JournalEntry => {
    const scheduleConfig: ScheduleConfig | undefined = scheduleEnabled
      ? {
          enabled: true,
          startDate: scheduleStartDate,
          endDate: scheduleEndDate,
          startTime: scheduleStartTime,
          endTime: scheduleEndTime,
          reminderTimes: ['准时提醒', '提前15分钟'],
          tagColor: scheduleDotColor,
        }
      : undefined;

    return {
      id: entryId,
      title: title.trim() || '随记小记',
      content,
      paperStyle,
      fontFamily,
      fontSize,
      lineHeight: 1.8,
      mood,
      weather,
      tags: [],
      createdAt: initialEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images,
      collageLayout,
      doodleStrokes,
      stickers,
      schedule: scheduleConfig,
      scope,
      spaceId: scope === 'shared' ? selectedSpaceId : undefined,
      isDraft,
      deletedAt: null,
      authorId: 'user_self',
      authorName: '我',
      allowRecommend: false,
    };
  };

  // Auto-save local draft on exit or unmount if not empty
  const handleExit = () => {
    if (title.trim() || content.trim() || images.length > 0) {
      // Save as draft
      const draft = getCurrentJournalData(true);
      StorageService.saveDraft(draft);
      showToast('已自动保存到本地草稿箱');
    }
    onClose();
  };

  // Manual sync to cloud
  const handleManualSyncCloud = () => {
    const draft = getCurrentJournalData(true);
    StorageService.saveDraft(draft);
    showToast('☁️ 云端模拟静默同步完成 · 基础容量永久免费');
  };

  // Formal Save
  const handleSave = () => {
    if (!title.trim() && !content.trim() && images.length === 0) {
      showToast('手账内容为空，请写点什么吧~');
      return;
    }

    const finalEntry = getCurrentJournalData(false);
    StorageService.saveJournal(finalEntry);

    // If there was a draft for this ID, clear it
    StorageService.deleteDraft(entryId);

    showToast('手账记录成功保存 ✨');
    setTimeout(() => {
      onSaveSuccess(finalEntry);
    }, 300);
  };

  // Save current layout as a custom template
  const handleSaveAsCustomTemplate = () => {
    const newTpl: TemplateItem = {
      id: `tpl_custom_${Date.now()}`,
      title: `${title.slice(0, 10) || '我的手账'} · 模版`,
      description: '由我精心调配的手账排版与配图样式',
      category: 'daily',
      isOfficial: false,
      authorName: '我',
      authorId: 'user_self',
      paperStyle,
      fontFamily,
      tags: ['自定义', '治愈手账'],
      sampleTitle: title,
      sampleContent: content,
      sampleMood: mood,
      sampleWeather: weather,
      sampleImages: images,
      sampleCollageLayout: collageLayout,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveTemplate(newTpl);
    showToast('已成功保存为「我的模板」，在模板广场随时可用！');
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const url = ev.target.result as string;
          const newImg: JournalImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            url,
            originalUrl: url,
            caption: '',
          };
          setImages((prev) => [...prev, newImg]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Place sticker onto page
  const handleAddSticker = (stickerItem: StickerItem) => {
    const placed: PlacedSticker = {
      id: `stk_placed_${Date.now()}`,
      stickerId: stickerItem.id,
      url: stickerItem.url,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 30,
      scale: 1,
      rotation: Math.round((Math.random() - 0.5) * 20),
    };
    setStickers((prev) => [...prev, placed]);
    setShowStickerPicker(false);
  };

  const currentFontClass = FONTS.find((f) => f.id === fontFamily)?.fontClass || 'font-sans';
  const currentPaper = PAPER_STYLES.find((p) => p.id === paperStyle) || PAPER_STYLES[0];

  return (
    <div
      id="journal-editor-page"
      className="fixed inset-0 z-50 bg-[#F4F0E8] flex flex-col overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <header className="h-14 px-4 bg-[#FAF7F2] border-b border-[#E8E1D5] flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExit}
            className="p-2 rounded-xl text-[#736354] hover:bg-[#EFE9DF] active:scale-95 transition-all"
            title="返回（自动保存草稿）"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-[#4A3E34]">
              {isEditingExisting ? '编辑手账' : '随手记手账'}
            </h1>
            <p className="text-[10px] text-[#9A897B] flex items-center space-x-1">
              <span>退出自动存草稿</span>
              <span>·</span>
              <button
                onClick={handleManualSyncCloud}
                className="hover:text-[#5E4E42] underline flex items-center space-x-0.5"
              >
                <Cloud className="w-2.5 h-2.5" />
                <span>手动存云端</span>
              </button>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-save-as-template"
            onClick={handleSaveAsCustomTemplate}
            className="p-2 rounded-xl text-[#786657] hover:bg-[#EFE9DF] hidden sm:flex items-center space-x-1 text-xs"
            title="存为模板"
          >
            <Bookmark className="w-4 h-4" />
            <span>存为模板</span>
          </button>

          <button
            id="btn-save-journal-entry"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] active:scale-95 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>完成</span>
          </button>
        </div>
      </header>

      {/* Main Journal Canvas / Paper Area */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center">
        <div
          ref={paperContainerRef}
          className={`w-full max-w-xl min-h-[750px] relative rounded-3xl shadow-sm border border-[#E3D8CA] p-6 sm:p-8 flex flex-col transition-all duration-300 ${currentPaper.bgClass}`}
        >
          {/* Handwriting Canvas overlay */}
          <HandwritingOverlay
            strokes={doodleStrokes}
            onChangeStrokes={setDoodleStrokes}
            isActive={isHandwritingActive}
            onToggleActive={() => setIsHandwritingActive(false)}
            containerHeight={paperContainerRef.current?.clientHeight || 800}
          />

          {/* Placed Stickers overlay */}
          <StickerLayer
            stickers={stickers}
            onChangeStickers={setStickers}
            readOnly={false}
          />

          {/* Top Paper Header: Mood, Weather, Date, Schedule Tag */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 border-b border-[#E8E1D5]/70 gap-2 mb-4">
            <div className="flex items-center space-x-2">
              {/* Mood picker trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowMoodPicker(!showMoodPicker)}
                  className="px-2.5 py-1 rounded-full bg-white/70 border border-[#E5DDCE] text-xs text-[#5C4D41] hover:bg-white flex items-center space-x-1 shadow-2xs"
                >
                  <span>{mood}</span>
                </button>
                {showMoodPicker && (
                  <div className="absolute top-8 left-0 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-[#E3D9CC] grid grid-cols-2 gap-1 w-56">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setMood(m);
                          setShowMoodPicker(false);
                        }}
                        className="px-2 py-1.5 rounded-lg text-xs text-left text-[#5C4D41] hover:bg-[#F2ECE3] transition-colors"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Weather selector */}
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="px-2 py-1 rounded-full bg-white/70 border border-[#E5DDCE] text-xs text-[#5C4D41] focus:outline-none shadow-2xs cursor-pointer"
              >
                {WEATHERS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Schedule indicator */}
            <div className="flex items-center space-x-2">
              {scheduleEnabled && (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center space-x-1 border shadow-2xs"
                  style={{
                    backgroundColor: `${scheduleDotColor}25`,
                    borderColor: scheduleDotColor,
                    color: scheduleDotColor,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: scheduleDotColor }}
                  />
                  <span>日程提醒 · {scheduleStartDate}</span>
                </button>
              )}
              <span className="text-xs text-[#9E8F80] font-mono">
                {new Date().toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Title Field */}
          <div className="relative z-10 mb-3">
            <input
              id="input-journal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="今日标题 / 随想记录..."
              className={`w-full bg-transparent text-xl sm:text-2xl font-semibold text-[#3D3228] placeholder-[#B5A799] focus:outline-none tracking-wide ${currentFontClass}`}
            />
          </div>

          {/* Image & Collage Section */}
          <div className="relative z-10">
            <CollageEditor
              images={images}
              layout={collageLayout}
              onLayoutChange={setCollageLayout}
              onUpdateImage={(id, updates) =>
                setImages((prev) =>
                  prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
                )
              }
              onRemoveImage={(id) => setImages((prev) => prev.filter((img) => img.id !== id))}
              onReorderImages={setImages}
            />
          </div>

          {/* Body Content (Textarea with free line breaks) */}
          <div className="relative z-10 flex-1 mt-2">
            <textarea
              id="input-journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写点什么吧... 记录生活里的细微光亮，无需排版压力，随心书写与涂鸦。"
              rows={12}
              style={{ fontSize: `${fontSize}px` }}
              className={`w-full bg-transparent text-[#3E342B] placeholder-[#B8ACA0] focus:outline-none resize-none leading-relaxed tracking-wide ${currentFontClass}`}
            />
          </div>

          {/* Scope Indicator (Bottom Corner) */}
          <div className="relative z-10 pt-4 mt-auto flex items-center justify-between text-xs text-[#998A7C] border-t border-[#EAE2D5]/70">
            <div className="flex items-center space-x-2">
              <span className="text-[11px]">可见权限:</span>
              <button
                onClick={() => setScope('personal')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  scope === 'personal'
                    ? 'bg-[#736254] text-white shadow-xs'
                    : 'bg-white/60 text-[#7A6B5E]'
                }`}
              >
                个人可见
              </button>
              <button
                onClick={() => setScope('shared')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  scope === 'shared'
                    ? 'bg-[#A86F68] text-white shadow-xs'
                    : 'bg-white/60 text-[#7A6B5E]'
                }`}
              >
                双人空间可见
              </button>
            </div>

            {scope === 'shared' && dualSpaces.length > 0 && (
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="bg-white/70 text-xs text-[#5C4D41] px-2 py-1 rounded-lg border border-[#E2D8CC] focus:outline-none"
              >
                {dualSpaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Floating Creative Toolbar */}
      <footer className="h-16 px-4 bg-[#FAF7F2] border-t border-[#E8E1D5] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {/* Add Image */}
          <button
            id="btn-add-photos"
            onClick={() => imageInputRef.current?.click()}
            className="p-2.5 rounded-xl text-[#6B5A4D] hover:bg-[#EDE5DA] active:scale-95 transition-all flex flex-col items-center"
            title="插入照片/拼图"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">照片拼图</span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Handwriting Toggle */}
          <button
            id="btn-toggle-handwriting"
            onClick={() => setIsHandwritingActive(!isHandwritingActive)}
            className={`p-2.5 rounded-xl flex flex-col items-center transition-all ${
              isHandwritingActive
                ? 'bg-[#736254] text-white shadow-xs'
                : 'text-[#6B5A4D] hover:bg-[#EDE5DA]'
            }`}
            title="手写与涂鸦"
          >
            <PenTool className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">手写涂鸦</span>
          </button>

          {/* AI Cutout Stickers */}
          <button
            id="btn-open-sticker-studio"
            onClick={() => setShowStickerStudio(true)}
            className="p-2.5 rounded-xl text-[#B36829] hover:bg-[#FAF0E6] active:scale-95 transition-all flex flex-col items-center"
            title="AI 智能拍照抠图贴纸"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">AI抠贴纸</span>
          </button>

          {/* Sticker Library */}
          <button
            id="btn-open-sticker-picker"
            onClick={() => setShowStickerPicker(true)}
            className="p-2.5 rounded-xl text-[#6B5A4D] hover:bg-[#EDE5DA] active:scale-95 transition-all flex flex-col items-center"
            title="贴纸素材库"
          >
            <Smile className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">贴纸库</span>
          </button>

          {/* Schedule Linkage */}
          <button
            id="btn-open-schedule-settings"
            onClick={() => setShowScheduleModal(true)}
            className={`p-2.5 rounded-xl flex flex-col items-center transition-all ${
              scheduleEnabled
                ? 'text-[#4F734F] bg-[#EAF2E9]'
                : 'text-[#6B5A4D] hover:bg-[#EDE5DA]'
            }`}
            title="转为日程提醒"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">日程联动</span>
          </button>
        </div>

        {/* Paper & Font Style Selectors */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Paper Style */}
          <select
            value={paperStyle}
            onChange={(e) => setPaperStyle(e.target.value as PaperStyle)}
            className="bg-[#EFE9DF] text-[#5C4D41] text-xs px-2.5 py-1.5 rounded-xl border border-[#DED4C7] focus:outline-none cursor-pointer"
            title="更换纸张背景（纯免费）"
          >
            {PAPER_STYLES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}背景
              </option>
            ))}
          </select>

          {/* Font Style */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as JournalFont)}
            className="bg-[#EFE9DF] text-[#5C4D41] text-xs px-2.5 py-1.5 rounded-xl border border-[#DED4C7] focus:outline-none cursor-pointer"
            title="更换字体（全部免费，无VIP限制）"
          >
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </footer>

      {/* AI Sticker Studio Modal */}
      <StickerStudioModal
        isOpen={showStickerStudio}
        onClose={() => setShowStickerStudio(false)}
        onSelectSticker={handleAddSticker}
      />

      {/* Sticker Library Picker Modal */}
      {showStickerPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-md w-full max-h-[80vh] flex flex-col shadow-xl border border-[#E8E1D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
              <div>
                <h3 className="text-sm font-semibold text-[#4A3E34]">选择贴纸装点手账</h3>
                <p className="text-[11px] text-[#9A897B]">永久免费 · 点击贴纸直接放置到页面</p>
              </div>
              <button
                onClick={() => setShowStickerPicker(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                ✕
              </button>
            </div>

            {/* Sticker grid */}
            <div className="flex-1 overflow-y-auto py-3 grid grid-cols-4 gap-3">
              {availableStickers.map((stk) => (
                <button
                  key={stk.id}
                  onClick={() => handleAddSticker(stk)}
                  className="p-2 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#8C7A6A] hover:shadow-xs transition-all flex flex-col items-center group"
                >
                  <img
                    src={stk.url}
                    alt={stk.name}
                    className="w-14 h-14 object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] text-[#7A6B5E] mt-1 truncate w-full text-center">
                    {stk.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between">
              <button
                onClick={() => {
                  setShowStickerPicker(false);
                  setShowStickerStudio(true);
                }}
                className="text-xs text-[#A07855] hover:underline flex items-center space-x-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>拍照制作新 AI 贴纸</span>
              </button>
              <button
                onClick={() => setShowStickerPicker(false)}
                className="px-3 py-1.5 rounded-xl bg-[#EFE9DF] text-[#5C4D41] text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Linkage Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-sm w-full shadow-xl border border-[#E8E1D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#5C4D41]" />
                <h3 className="text-sm font-semibold text-[#4A3E34]">日历日程联动设置</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                ✕
              </button>
            </div>

            {/* Toggle switch: 转为日程 */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EAE2D5]">
              <div>
                <span className="text-xs font-medium text-[#4A3E34]">转为日程任务</span>
                <p className="text-[10px] text-[#9E8F80]">
                  在日历格子中高亮标记，取消勾选将自动清除提醒
                </p>
              </div>
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#736254] cursor-pointer"
              />
            </div>

            {scheduleEnabled && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs text-[#6E5D4F] block mb-1">
                    日程日期（可与记录日期不一致）：
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={scheduleStartDate}
                      onChange={(e) => setScheduleStartDate(e.target.value)}
                      className="w-full bg-white border border-[#E2D8CC] rounded-xl px-2 py-1.5 text-xs text-[#4A3E34] focus:outline-none"
                    />
                    <input
                      type="date"
                      value={scheduleEndDate}
                      onChange={(e) => setScheduleEndDate(e.target.value)}
                      className="w-full bg-white border border-[#E2D8CC] rounded-xl px-2 py-1.5 text-xs text-[#4A3E34] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#6E5D4F] block mb-1">提醒起止时间：</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={scheduleStartTime}
                      onChange={(e) => setScheduleStartTime(e.target.value)}
                      className="w-full bg-white border border-[#E2D8CC] rounded-xl px-2 py-1.5 text-xs text-[#4A3E34] focus:outline-none"
                    />
                    <input
                      type="time"
                      value={scheduleEndTime}
                      onChange={(e) => setScheduleEndTime(e.target.value)}
                      className="w-full bg-white border border-[#E2D8CC] rounded-xl px-2 py-1.5 text-xs text-[#4A3E34] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dot color indicator */}
                <div>
                  <label className="text-xs text-[#6E5D4F] block mb-1.5">
                    日历圆点标记色（与普通手账区分）：
                  </label>
                  <div className="flex items-center space-x-2.5">
                    {SCHEDULE_DOT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setScheduleDotColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          scheduleDotColor === c ? 'border-[#3D3228] scale-110 shadow-xs' : 'border-white'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium"
              >
                保存日程配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#4A3E34]/95 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
