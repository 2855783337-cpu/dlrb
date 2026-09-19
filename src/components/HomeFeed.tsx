import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  BookOpen,
  Filter,
} from 'lucide-react';
import { JournalEntry, TemplateItem } from '../types';

interface HomeFeedProps {
  journals: JournalEntry[];
  onOpenJournal: (entry: JournalEntry) => void;
  onNewJournal: () => void;
  onOpenStickerStudio: () => void;
  onOpenTemplateSquare: () => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  journals,
  onOpenJournal,
  onNewJournal,
  onOpenStickerStudio,
  onOpenTemplateSquare,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  // Filter personal & active journals (excluding soft-deleted)
  const personalJournals = journals.filter(
    (j) => !j.deletedAt && !j.isDraft && j.scope === 'personal'
  );

  const filteredJournals = personalJournals.filter((j) => {
    const matchesSearch =
      !searchQuery ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood =
      selectedMoodFilter === 'all' || j.mood.includes(selectedMoodFilter);
    return matchesSearch && matchesMood;
  });

  return (
    <div id="home-feed-view" className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Top Greeting & Healing Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-mono text-[#9E8F80] tracking-wider uppercase">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </span>
          <h1 className="text-xl font-semibold text-[#4A3E34] tracking-wide mt-0.5">
            安暖如常，随心小记
          </h1>
        </div>

        <button
          id="btn-quick-new-journal"
          onClick={onNewJournal}
          className="w-10 h-10 rounded-2xl bg-[#7D6B5D] text-white flex items-center justify-center shadow-xs hover:bg-[#68584B] active:scale-95 transition-all"
          title="写新手账"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Quick Healing Inspiration Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenStickerStudio}
          className="p-3 rounded-2xl bg-[#FAF4ED] border border-[#EADBCA] hover:bg-[#F7EFE3] transition-all flex items-center space-x-2 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E8DDD1] flex items-center justify-center text-[#B36829] group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#5C4533] block">AI 拍照抠贴纸</span>
            <span className="text-[10px] text-[#9A816B]">全免费 · 随手拍</span>
          </div>
        </button>

        <button
          onClick={onOpenTemplateSquare}
          className="p-3 rounded-2xl bg-[#EFF3EE] border border-[#DCE4DA] hover:bg-[#E7EDE6] transition-all flex items-center space-x-2 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#DCE4DA] flex items-center justify-center text-[#4F734F] group-hover:scale-110 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#3C573C] block">一键套用模板</span>
            <span className="text-[10px] text-[#7A997A]">零排版 · 100%免费</span>
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#A69B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索手账标题或文字记忆..."
          className="w-full bg-[#FAF7F2] border border-[#E8E1D5] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#4A3E34] placeholder-[#B5A799] focus:outline-none focus:border-[#8C7A6A] transition-colors"
        />
      </div>

      {/* Journal Cards Feed */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-[#9E8F80] px-1">
          <span>我的个人手账 ({filteredJournals.length})</span>
          <span className="text-[10px]">纯本地私密存储</span>
        </div>

        {filteredJournals.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-3xl p-10 text-center text-xs text-[#9E8F80] border border-[#E8E1D5] space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-[#C2B4A3] stroke-[1.5]" />
            <p>还没有符合条件的手账记录</p>
            <button
              onClick={onNewJournal}
              className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] transition-colors"
            >
              写下第一篇手账
            </button>
          </div>
        ) : (
          filteredJournals.map((journal) => {
            const hasSchedule = journal.schedule?.enabled;
            const hasDoodles = journal.doodleStrokes && journal.doodleStrokes.length > 0;
            const hasStickers = journal.stickers && journal.stickers.length > 0;

            return (
              <div
                key={journal.id}
                id={`journal-card-${journal.id}`}
                onClick={() => onOpenJournal(journal)}
                className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-2xs hover:shadow-xs hover:border-[#8C7A6A] transition-all cursor-pointer group space-y-3"
              >
                {/* Card Top: Date & Mood pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-[#E8E1D5] text-xs text-[#6B5A4D]">
                      {journal.mood}
                    </span>
                    <span className="text-xs text-[#A69B90]">{journal.weather}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasSchedule && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: journal.schedule?.tagColor || '#A8BBA2' }}
                        title="已关联日程提醒"
                      />
                    )}
                    <span className="text-xs text-[#A69B90] font-mono">
                      {journal.createdAt.slice(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Card Title & Content Snippet */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-semibold text-[#4A3E34] group-hover:text-[#68584B] transition-colors">
                    {journal.title}
                  </h3>
                  <p className="text-xs text-[#6E5D4F] leading-relaxed line-clamp-2">
                    {journal.content}
                  </p>
                </div>

                {/* Card Images Collage Preview */}
                {journal.images.length > 0 && (
                  <div
                    className={`rounded-2xl overflow-hidden bg-white/60 p-1.5 border border-[#EBE2D5] ${
                      journal.images.length === 1
                        ? 'grid grid-cols-1'
                        : journal.images.length === 2
                        ? 'grid grid-cols-2 gap-1.5'
                        : 'grid grid-cols-3 gap-1.5'
                    }`}
                  >
                    {journal.images.slice(0, 3).map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F0EBE3]"
                      >
                        <img
                          src={img.doodleOverlay || img.url}
                          alt="preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Bottom: Metadata Badges */}
                <div className="flex items-center justify-between text-[11px] text-[#A69B90] pt-1">
                  <div className="flex items-center space-x-2">
                    {hasDoodles && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EFE8DE] text-[#7A6B5E]">
                        ✍️ 含手绘涂鸦
                      </span>
                    )}
                    {hasStickers && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#A06C38]">
                        ✨ {journal.stickers.length} 个贴纸
                      </span>
                    )}
                  </div>

                  {hasSchedule && (
                    <div className="flex items-center space-x-1 text-[#4F734F]">
                      <Clock className="w-3 h-3" />
                      <span>{journal.schedule?.startTime} 提醒</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
