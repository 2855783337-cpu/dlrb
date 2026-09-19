import React, { useState, useRef } from 'react';
import { RotateCw, FlipHorizontal, Trash2, Move } from 'lucide-react';
import { PlacedSticker } from '../types';

interface StickerLayerProps {
  stickers: PlacedSticker[];
  onChangeStickers: (stickers: PlacedSticker[]) => void;
  readOnly?: boolean;
}

export const StickerLayer: React.FC<StickerLayerProps> = ({
  stickers,
  onChangeStickers,
  readOnly = false,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDownSticker = (e: React.PointerEvent, stk: PlacedSticker) => {
    if (readOnly) return;
    e.stopPropagation();
    setSelectedId(stk.id);

    dragRef.current = {
      id: stk.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: stk.x,
      initY: stk.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;

    const nextX = Math.max(0, Math.min(100, dragRef.current.initX + dx));
    const nextY = Math.max(0, Math.min(100, dragRef.current.initY + dy));

    const updated = stickers.map((s) =>
      s.id === dragRef.current?.id ? { ...s, x: nextX, y: nextY } : s
    );
    onChangeStickers(updated);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleRotate = (stkId: string) => {
    const updated = stickers.map((s) =>
      s.id === stkId ? { ...s, rotation: (s.rotation + 15) % 360 } : s
    );
    onChangeStickers(updated);
  };

  const handleFlip = (stkId: string) => {
    const updated = stickers.map((s) =>
      s.id === stkId ? { ...s, flipped: !s.flipped } : s
    );
    onChangeStickers(updated);
  };

  const handleScale = (stkId: string, delta: number) => {
    const updated = stickers.map((s) => {
      if (s.id === stkId) {
        const nextScale = Math.max(0.5, Math.min(2.5, (s.scale || 1) + delta));
        return { ...s, scale: nextScale };
      }
      return s;
    });
    onChangeStickers(updated);
  };

  const handleDelete = (stkId: string) => {
    onChangeStickers(stickers.filter((s) => s.id !== stkId));
    setSelectedId(null);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => setSelectedId(null)}
      className="absolute inset-0 z-15 overflow-hidden pointer-events-none"
    >
      {stickers.map((stk) => {
        const isSelected = selectedId === stk.id && !readOnly;
        return (
          <div
            key={stk.id}
            onPointerDown={(e) => handlePointerDownSticker(e, stk)}
            style={{
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale || 1}) scaleX(${
                stk.flipped ? -1 : 1
              })`,
            }}
            className={`absolute pointer-events-auto select-none touch-none cursor-move ${
              isSelected ? 'ring-2 ring-dashed ring-[#8C6D53] rounded-lg p-1' : ''
            }`}
          >
            <img
              src={stk.url}
              alt="手账贴纸"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm pointer-events-none"
            />

            {/* Selected Control Handles */}
            {isSelected && (
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-white/95 rounded-full px-1.5 py-0.5 shadow-md border border-[#D9CEBF] z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleRotate(stk.id)}
                  className="p-1 text-[#6E5D4F] hover:bg-[#F2ECE3] rounded-full"
                  title="旋转"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFlip(stk.id)}
                  className="p-1 text-[#6E5D4F] hover:bg-[#F2ECE3] rounded-full"
                  title="水平翻转"
                >
                  <FlipHorizontal className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleScale(stk.id, 0.1)}
                  className="px-1 text-[10px] font-bold text-[#6E5D4F] hover:bg-[#F2ECE3] rounded"
                  title="放大"
                >
                  +
                </button>
                <button
                  onClick={() => handleScale(stk.id, -0.1)}
                  className="px-1 text-[10px] font-bold text-[#6E5D4F] hover:bg-[#F2ECE3] rounded"
                  title="缩小"
                >
                  -
                </button>
                <button
                  onClick={() => handleDelete(stk.id)}
                  className="p-1 text-[#D9776C] hover:bg-[#FBEAE8] rounded-full"
                  title="删除贴纸"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
