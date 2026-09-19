import React, { useRef } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  Lock,
} from 'lucide-react';
import { JournalEntry } from '../types';
import { CollageEditor } from './CollageEditor';
import { HandwritingOverlay } from './HandwritingOverlay';
import { StickerLayer } from './StickerLayer';

interface JournalDetailModalProps {
  journal: JournalEntry | null;
  onClose: () => void;
  onEdit: (journal: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const FONTS_MAP: Record<string, string> = {
  default: 'font-sans',
  mashan: 'font-mashan',
  kuaile: 'font-kuaile',
  longcang: 'font-longcang',
  'serif-sc': 'font-serif-sc',
  caveat: 'font-caveat',
};

const PAPERS_MAP: Record<string, string> = {
  blank: 'bg-white',
  grid: 'bg-[#FBF9F5] paper-grid',
  dots: 'bg-[#FAF8F5] paper-dots',
  lined: 'bg-[#FCFAF6] paper-lined',
  kraft: 'bg-[#F3E7D7]',
  'morandi-green': 'bg-[#EFF3EE]',
  'soft-pink': 'bg-[#FAF1EC]',
};

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  journal,
  onClose,
  onEdit,
  onDelete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!journal) return null;

  const fontClass = FONTS_MAP[journal.fontFamily] || 'font-sans';
  const paperClass = PAPERS_MAP[journal.paperStyle] || 'bg-white';

  const handleDelete = () => {
    if (window.confirm('确认将这篇手账移入回收站？回收站将保留 30 天，期间可随时恢复。')) {
      onDelete(journal.id);
      onClose();
    }
  };

  return (
    <div
      id="journal-detail-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Bar with Actions */}
        <div className="flex items-center justify-between pb-2.5 px-2 text-white">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-white/90">
              {journal.scope === 'shared' ? '双人私密手账' : '个人私密手账'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(journal);
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="编辑手账"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-white/20 hover:bg-[#D9776C] text-white transition-colors"
              title="移入回收站"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Surface */}
        <div
          ref={containerRef}
          className={`relative rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E0D5C7] overflow-hidden flex flex-col min-h-[550px] max-h-[80vh] overflow-y-auto ${paperClass}`}
        >
          {/* Handwriting Canvas */}
          <HandwritingOverlay
            strokes={journal.doodleStrokes || []}
            onChangeStrokes={() => {}}
            isActive={false}
            onToggleActive={() => {}}
            containerHeight={containerRef.current?.clientHeight || 600}
          />

          {/* Placed Stickers */}
          <StickerLayer
            stickers={journal.stickers || []}
            onChangeStickers={() => {}}
            readOnly={true}
          />

          {/* Header Info */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[#E8E1D5]/70 gap-2 mb-3">
            <div className="flex items-center space-x-2 text-xs text-[#6B5A4D]">
              <span className="font-medium">{journal.mood}</span>
              <span>·</span>
              <span>{journal.weather}</span>
            </div>

            <div className="flex items-center space-x-2">
              {journal.schedule && journal.schedule.enabled && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center space-x-1"
                  style={{
                    backgroundColor: `${journal.schedule.tagColor || '#A8BBA2'}20`,
                    color: journal.schedule.tagColor || '#4F734F',
                  }}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    日程：{journal.schedule.startDate} ({journal.schedule.startTime})
                  </span>
                </span>
              )}
              <span className="text-xs text-[#9E8F80] font-mono">
                {journal.createdAt.slice(0, 10)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2
            className={`relative z-10 text-xl sm:text-2xl font-semibold text-[#3D3228] mb-3 tracking-wide ${fontClass}`}
          >
            {journal.title}
          </h2>

          {/* Images & Collage */}
          {journal.images.length > 0 && (
            <div className="relative z-10 mb-4">
              <CollageEditor
                images={journal.images}
                layout={journal.collageLayout || 'single'}
                onLayoutChange={() => {}}
                onUpdateImage={() => {}}
                onRemoveImage={() => {}}
                onReorderImages={() => {}}
                readOnly={true}
              />
            </div>
          )}

          {/* Body Content */}
          <div className="relative z-10 flex-1">
            <p
              style={{ fontSize: `${journal.fontSize || 16}px` }}
              className={`text-[#3E342B] whitespace-pre-wrap leading-relaxed tracking-wide ${fontClass}`}
            >
              {journal.content}
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 pt-4 mt-6 border-t border-[#EAE2D5]/70 flex items-center justify-between text-[11px] text-[#A69B90]">
            <span>字数：{journal.content.length} 字</span>
            <div className="flex items-center space-x-2">
              {journal.scope === 'shared' ? (
                <span className="flex items-center space-x-1 text-[#A86F68]">
                  <Lock className="w-3 h-3" />
                  <span>双人空间已同步</span>
                </span>
              ) : (
                <span>私密留存</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
