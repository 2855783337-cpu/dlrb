import React, { useState, useRef } from 'react';
import {
  Grid,
  Columns,
  Rows,
  Layers,
  Film,
  Maximize2,
  Trash2,
  ArrowLeftRight,
  Edit3,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { JournalImage, CollageLayout } from '../types';

interface CollageEditorProps {
  images: JournalImage[];
  layout: CollageLayout;
  onLayoutChange: (layout: CollageLayout) => void;
  onUpdateImage: (id: string, updates: Partial<JournalImage>) => void;
  onRemoveImage: (id: string) => void;
  onReorderImages: (newImages: JournalImage[]) => void;
  readOnly?: boolean;
}

export const CollageEditor: React.FC<CollageEditorProps> = ({
  images,
  layout,
  onLayoutChange,
  onUpdateImage,
  onRemoveImage,
  onReorderImages,
  readOnly = false,
}) => {
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  // Doodle on single photo state
  const [doodleColor, setDoodleColor] = useState<string>('#E07A5F');
  const [doodleBrushSize, setDoodleBrushSize] = useState<number>(5);
  const doodleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDoodlingRef = useRef<boolean>(false);

  if (images.length === 0) return null;

  const layoutOptions: { id: CollageLayout; label: string; icon: any }[] = [
    { id: 'single', label: '原样画报', icon: Rows },
    { id: 'two-horizontal', label: '双图并排', icon: Columns },
    { id: 'two-vertical', label: '上下拼合', icon: Rows },
    { id: 'three-grid', label: '三图拼贴', icon: Layers },
    { id: 'polaroid-quad', label: '四格拍立得', icon: Grid },
    { id: 'filmstrip', label: '复古胶卷', icon: Film },
  ];

  // Move image index
  const handleSwap = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const copied = [...images];
    const item = copied.splice(fromIdx, 1)[0];
    copied.splice(toIdx, 0, item);
    onReorderImages(copied);
  };

  // Open doodle modal for an image
  const startDoodleOnImage = (img: JournalImage) => {
    setEditingImageId(img.id);
    setTimeout(() => {
      const canvas = doodleCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      baseImg.onload = () => {
        canvas.width = baseImg.naturalWidth || 600;
        canvas.height = baseImg.naturalHeight || 600;
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
        // If has existing doodle
        if (img.doodleOverlay) {
          const overlay = new Image();
          overlay.onload = () => ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
          overlay.src = img.doodleOverlay;
        }
      };
      baseImg.src = img.url;
    }, 100);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDoodlingRef.current = true;
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDoodlingRef.current) return;
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.fillStyle = doodleColor;
    ctx.beginPath();
    ctx.arc(x, y, doodleBrushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleSaveDoodle = () => {
    const canvas = doodleCanvasRef.current;
    if (canvas && editingImageId) {
      const resultDataUrl = canvas.toDataURL('image/png');
      onUpdateImage(editingImageId, { doodleOverlay: resultDataUrl });
    }
    setEditingImageId(null);
  };

  return (
    <div className="my-3 space-y-2.5">
      {/* Layout selector tabs (only when more than 1 image and in edit mode) */}
      {!readOnly && images.length > 1 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] text-[#8C7B6D] shrink-0 font-medium mr-1">拼图模板:</span>
          {layoutOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = layout === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onLayoutChange(opt.id)}
                className={`px-2 py-1 rounded-lg text-xs flex items-center space-x-1 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#736254] text-white shadow-xs'
                    : 'bg-[#F0EAE1] text-[#7A6B5E] hover:bg-[#E4DCD0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Collage Container Layouts */}
      <div
        className={`w-full rounded-2xl overflow-hidden p-1.5 bg-[#FAF6F0] border border-[#E8E1D5] ${
          layout === 'two-horizontal'
            ? 'grid grid-cols-2 gap-2'
            : layout === 'two-vertical'
            ? 'flex flex-col space-y-2'
            : layout === 'three-grid'
            ? 'grid grid-cols-2 gap-2'
            : layout === 'polaroid-quad'
            ? 'grid grid-cols-2 gap-2.5'
            : layout === 'filmstrip'
            ? 'flex overflow-x-auto space-x-2 pb-1.5'
            : 'flex flex-col space-y-3'
        }`}
      >
        {images.map((img, idx) => {
          const isPolaroid = layout === 'polaroid-quad';
          return (
            <div
              key={img.id}
              className={`relative group rounded-xl overflow-hidden transition-all ${
                isPolaroid
                  ? 'bg-white p-2 pb-3 shadow-xs border border-[#E5DDCE] rotate-[0.5deg]'
                  : 'bg-white/90 border border-[#ECE5DA]'
              } ${layout === 'filmstrip' ? 'min-w-[180px] max-w-[200px] shrink-0' : 'w-full'}`}
            >
              {/* Image box */}
              <div className="relative overflow-hidden rounded-lg bg-[#F0EBE3] aspect-[4/3]">
                <img
                  src={img.doodleOverlay || img.url}
                  alt={img.caption || '手账配图'}
                  className="w-full h-full object-cover"
                />

                {/* Top overlay controls */}
                <div className="absolute top-1.5 right-1.5 flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* View original full photo */}
                  <button
                    onClick={() => setZoomImageUrl(img.originalUrl || img.url)}
                    className="p-1 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
                    title="查看高清原图"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {!readOnly && (
                    <>
                      {/* Doodle on photo */}
                      <button
                        onClick={() => startDoodleOnImage(img)}
                        className="p-1 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
                        title="在照片上涂鸦涂画"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Swap order */}
                      {images.length > 1 && (
                        <button
                          onClick={() => handleSwap(idx, (idx + 1) % images.length)}
                          className="p-1 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
                          title="换序"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => onRemoveImage(img.id)}
                        className="p-1 rounded-md bg-[#D9776C]/85 text-white hover:bg-[#D9776C] transition-colors"
                        title="移除照片"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Independent text caption under image */}
              <div className="p-1.5">
                {readOnly ? (
                  img.caption && (
                    <p className="text-[11px] text-[#786657] font-serif text-center italic">
                      {img.caption}
                    </p>
                  )
                ) : (
                  <input
                    type="text"
                    value={img.caption || ''}
                    onChange={(e) => onUpdateImage(img.id, { caption: e.target.value })}
                    placeholder="添加这张照片的独家备注..."
                    className="w-full bg-transparent text-[11px] text-[#5C4D41] placeholder-[#BDB2A5] focus:outline-none text-center border-b border-dashed border-[#E3D9CC] focus:border-[#7A6B5E] py-0.5"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom / View Original Image Modal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] flex flex-col items-center">
            <img
              src={zoomImageUrl}
              alt="原图查看"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex items-center space-x-3 text-white text-xs bg-black/40 px-3 py-1.5 rounded-full">
              <span>原始素材完好保存 · 点击任意处返回</span>
              <button
                onClick={() => setZoomImageUrl(null)}
                className="hover:text-[#E2DDD3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Doodle Annotation Modal */}
      {editingImageId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-4 max-w-lg w-full shadow-2xl border border-[#E8E1D5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D8]">
              <h3 className="text-sm font-semibold text-[#4A3E34] flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#A07855]" />
                <span>照片手绘涂鸦标注</span>
              </h3>
              <button
                onClick={() => setEditingImageId(null)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas area */}
            <div className="w-full h-64 bg-black/5 rounded-xl overflow-hidden flex items-center justify-center border border-[#DDD3C5]">
              <canvas
                ref={doodleCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={() => (isDoodlingRef.current = false)}
                className="max-h-full max-w-full object-contain cursor-crosshair"
              />
            </div>

            {/* Color palette */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#FFFFFF', '#333333'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setDoodleColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      doodleColor === c ? 'border-[#4A3E34] scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingImageId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#7A6B5E] hover:bg-[#EAE3D8]"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveDoodle}
                  className="px-4 py-1.5 rounded-lg bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] flex items-center space-x-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>完成涂鸦</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
