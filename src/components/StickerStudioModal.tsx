import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Eraser,
  Paintbrush,
  RotateCcw,
  Camera,
  Upload,
  Check,
  ZoomIn,
  Loader2,
  Tag,
} from 'lucide-react';
import { processAICutout, loadImage } from '../utils/aiCutout';
import { StorageService } from '../utils/storage';
import { StickerItem } from '../types';

interface StickerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker?: (sticker: StickerItem) => void;
}

export const StickerStudioModal: React.FC<StickerStudioModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [toolMode, setToolMode] = useState<'eraser' | 'restore'>('eraser');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [stickerName, setStickerName] = useState<string>('我的手账贴纸');
  const [hasHistory, setHasHistory] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const historyStackRef = useRef<ImageData[]>([]);

  // Sample cute reference images for fast trial
  const samplePresets = [
    {
      name: '暖心热咖啡',
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: '小盆多肉',
      url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: '可颂面包',
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const handleSelectImage = (dataUrl: string, name?: string) => {
    setOriginalImage(dataUrl);
    if (name) setStickerName(name);
    historyStackRef.current = [];
    setHasHistory(false);
    startAICutout(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleSelectImage(event.target.result as string, file.name.split('.')[0] || '拍照贴纸');
      }
    };
    reader.readAsDataURL(file);
  };

  const startAICutout = async (imgSrc: string) => {
    setIsProcessingAI(true);
    try {
      // 1. Prepare original background canvas
      const img = await loadImage(imgSrc);
      const origCanvas = document.createElement('canvas');
      const maxDim = 600;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      origCanvas.width = w;
      origCanvas.height = h;
      const origCtx = origCanvas.getContext('2d');
      if (origCtx) {
        origCtx.drawImage(img, 0, 0, w, h);
        originalCanvasRef.current = origCanvas;
      }

      // 2. Perform intelligent AI cutout
      const cutoutDataUrl = await processAICutout(imgSrc);
      const cutoutImg = await loadImage(cutoutDataUrl);

      // 3. Render onto main interactive canvas
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(cutoutImg, 0, 0, w, h);
          // push initial state to history
          historyStackRef.current = [ctx.getImageData(0, 0, w, h)];
          setHasHistory(false);
        }
      }
    } catch (err) {
      console.error('Cutout failed', err);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Drawing canvas erase / restore
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history snapshot before stroke
    historyStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyStackRef.current.length > 10) historyStackRef.current.shift();
    setHasHistory(true);

    isDrawingRef.current = true;
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (toolMode === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Restore from original image
      const origCanvas = originalCanvasRef.current;
      if (!origCanvas) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(origCanvas, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prev = historyStackRef.current.pop();
    if (prev) {
      ctx.putImageData(prev, 0, 0);
    }
    setHasHistory(historyStackRef.current.length > 0);
  };

  const handleSaveSticker = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const transparentDataUrl = canvas.toDataURL('image/png');

    const newSticker: StickerItem = {
      id: `stk_custom_${Date.now()}`,
      name: stickerName.trim() || '自制贴纸',
      url: transparentDataUrl,
      category: 'custom',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveCustomSticker(newSticker);

    if (onSelectSticker) {
      onSelectSticker(newSticker);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-ai-sticker-studio"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] border border-[#E8E1D5]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E1D5] flex items-center justify-between bg-white/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#EFE7DE] text-[#786657] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C27D38]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#4A3E34] flex items-center space-x-1">
                <span>AI 智能抠图贴纸</span>
                <span className="text-[10px] bg-[#EAF2E9] text-[#4F734F] px-1.5 py-0.5 rounded-full font-normal">
                  100% 免费
                </span>
              </h2>
              <p className="text-xs text-[#9E9084]">一键抠出透明背景，带手动擦除与修复</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C7D70] hover:bg-[#EFE9E0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {!originalImage ? (
            /* Upload / Capture Screen */
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#F0E9DF] flex items-center justify-center text-[#8C7A6A] shadow-inner">
                <Camera className="w-9 h-9 stroke-[1.5]" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-[#4A3E34]">上传照片或现场拍照</h3>
                <p className="text-xs text-[#9E9084] mt-1 max-w-xs">
                  自动识别主体并生成无缝透明贴纸，随心装饰手账
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  id="btn-upload-local-photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] active:scale-95 transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>选择手机相册</span>
                </button>
                <button
                  id="btn-take-camera-photo"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#D9CEBF] text-[#5C4D41] text-xs font-medium hover:bg-[#F5EFE6] active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>拍照抠图</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Sample trial photos */}
              <div className="w-full pt-4 border-t border-[#EAE3D8]">
                <p className="text-xs font-medium text-[#7A6B5E] mb-2 text-center">
                  🌱 没拍照片？试一试治愈素材样本：
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {samplePresets.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectImage(item.url, item.name)}
                      className="p-1.5 rounded-xl bg-white border border-[#E3D9CC] hover:border-[#9A8778] transition-all flex flex-col items-center group text-left"
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-16 object-cover rounded-lg group-hover:opacity-90"
                      />
                      <span className="text-[11px] text-[#6A5B4F] mt-1 truncate w-full text-center">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Editing Canvas Screen */
            <div className="space-y-3">
              {/* Canvas viewport with checkerboard background */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#DDD3C5] bg-[repeating-conic-gradient(#EFEAE1_0%_25%,#FAF7F2_0%_50%)] bg-[size:16px_16px] flex items-center justify-center touch-none">
                {isProcessingAI && (
                  <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-2">
                    <Loader2 className="w-7 h-7 text-[#A07855] animate-spin" />
                    <p className="text-xs font-medium text-[#5E4D40]">AI 正在识别主体并抠出透明贴纸...</p>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="max-h-full max-w-full object-contain cursor-crosshair"
                />
              </div>

              {/* Toolbar */}
              <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DCD0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <button
                      id="btn-mode-eraser"
                      onClick={() => setToolMode('eraser')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                        toolMode === 'eraser'
                          ? 'bg-[#736254] text-white shadow-xs'
                          : 'bg-[#F2ECE3] text-[#6B5A4D] hover:bg-[#E8E0D5]'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>手动擦除</span>
                    </button>
                    <button
                      id="btn-mode-restore"
                      onClick={() => setToolMode('restore')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                        toolMode === 'restore'
                          ? 'bg-[#736254] text-white shadow-xs'
                          : 'bg-[#F2ECE3] text-[#6B5A4D] hover:bg-[#E8E0D5]'
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                      <span>修复修补</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleUndo}
                      disabled={!hasHistory}
                      className="p-1.5 rounded-lg text-[#7A6A5E] hover:bg-[#F2ECE3] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="撤销上一步"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => originalImage && startAICutout(originalImage)}
                      className="px-2 py-1 rounded-lg text-[11px] text-[#A07855] hover:bg-[#F7EFE6] flex items-center space-x-1 font-medium"
                      title="重新执行AI抠图"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>重抠</span>
                    </button>
                  </div>
                </div>

                {/* Brush size slider */}
                <div className="flex items-center space-x-3 text-xs text-[#7A6B5F]">
                  <span className="shrink-0 text-[11px]">笔刷粗细:</span>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="flex-1 accent-[#7A6B5E] cursor-pointer"
                  />
                  <span className="w-6 text-right font-mono text-[11px]">{brushSize}px</span>
                </div>

                {/* Sticker Name */}
                <div className="flex items-center space-x-2 pt-1 border-t border-[#F0E9DF]">
                  <Tag className="w-3.5 h-3.5 text-[#9A897B]" />
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    placeholder="给自制贴纸起个名字..."
                    className="flex-1 bg-transparent text-xs text-[#4A3E34] focus:outline-none placeholder-[#B0A294]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E8E1D5] bg-white/70 flex items-center justify-between">
          {originalImage ? (
            <button
              onClick={() => {
                setOriginalImage(null);
                historyStackRef.current = [];
              }}
              className="text-xs text-[#8C7D70] hover:text-[#5E4D40] py-1.5"
            >
              重新选图
            </button>
          ) : (
            <span className="text-[11px] text-[#A39486]">贴纸库容量无上限 · 永久免费</span>
          )}

          {originalImage && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs text-[#7A6B5E] hover:bg-[#EDE5DA] transition-colors"
              >
                取消
              </button>
              <button
                id="btn-save-custom-sticker"
                onClick={handleSaveSticker}
                disabled={isProcessingAI}
                className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] active:scale-95 transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存并贴入</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
