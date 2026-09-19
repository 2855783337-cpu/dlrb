import React, { useRef, useEffect, useState } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Check,
  Palette,
} from 'lucide-react';
import { DoodleStroke } from '../types';

interface HandwritingOverlayProps {
  strokes: DoodleStroke[];
  onChangeStrokes: (newStrokes: DoodleStroke[]) => void;
  isActive: boolean;
  onToggleActive: () => void;
  containerHeight: number;
}

const MORANDI_COLORS = [
  { name: '温暖栗褐', hex: '#634832' },
  { name: '静谧墨黑', hex: '#2B2825' },
  { name: '鼠尾草绿', hex: '#587058' },
  { name: '陶土暖红', hex: '#B85D43' },
  { name: '暮霭天蓝', hex: '#5A738E' },
  { name: '杏仁暖黄', hex: '#D99B43' },
];

export const HandwritingOverlay: React.FC<HandwritingOverlayProps> = ({
  strokes,
  onChangeStrokes,
  isActive,
  onToggleActive,
  containerHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>('#634832');
  const [width, setWidth] = useState<number>(4);
  const [opacity, setOpacity] = useState<number>(0.9);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Redo stack
  const [redoStack, setRedoStack] = useState<DoodleStroke[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Redraw all strokes whenever strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      ctx.save();
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.globalAlpha = stroke.opacity;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [strokes, containerHeight]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPointsRef.current = [{ x, y }];

    // Live drawing preview
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(1 / dpr, 1 / dpr);
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = width * 2 * dpr;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = width * dpr;
        ctx.globalAlpha = opacity;
      }
      ctx.beginPath();
      ctx.arc(x * dpr, y * dpr, (width * dpr) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPointsRef.current.push({ x, y });

    // Live continuous stroke
    const ctx = canvas.getContext('2d');
    if (ctx && currentPointsRef.current.length > 1) {
      const pts = currentPointsRef.current;
      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(1 / dpr, 1 / dpr);
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = width * 2 * dpr;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = width * dpr;
        ctx.globalAlpha = opacity;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(prev.x * dpr, prev.y * dpr);
      ctx.lineTo(curr.x * dpr, curr.y * dpr);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = () => {
    if (!isActive || !isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      const newStroke: DoodleStroke = {
        color,
        width: isEraser ? width * 2 : width,
        opacity,
        isEraser,
        points: [...currentPointsRef.current],
      };
      onChangeStrokes([...strokes, newStroke]);
      setRedoStack([]);
      currentPointsRef.current = [];
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStack((prev) => [last, ...prev]);
    onChangeStrokes(strokes.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    onChangeStrokes([...strokes, next]);
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    onChangeStrokes([]);
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full ${isActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* Floating Toolbar when handwriting mode is active */}
      {isActive && (
        <div className="absolute top-2 left-2 right-2 z-30 pointer-events-auto bg-[#FAF7F2]/95 backdrop-blur-md p-2.5 rounded-2xl border border-[#E3D9CC] shadow-lg flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            {/* Mode: Pen vs Eraser */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsEraser(false)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all ${
                  !isEraser
                    ? 'bg-[#736254] text-white shadow-xs'
                    : 'bg-[#EDE5DA] text-[#6E5D4F] hover:bg-[#E3D8CB]'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>手写画笔</span>
              </button>
              <button
                onClick={() => setIsEraser(true)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all ${
                  isEraser
                    ? 'bg-[#736254] text-white shadow-xs'
                    : 'bg-[#EDE5DA] text-[#6E5D4F] hover:bg-[#E3D8CB]'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>橡皮擦</span>
              </button>
            </div>

            {/* Actions: Undo / Redo / Clear / Finish */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="p-1.5 rounded-lg text-[#6E5D4F] hover:bg-[#EDE5DA] disabled:opacity-30"
                title="撤销"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-1.5 rounded-lg text-[#6E5D4F] hover:bg-[#EDE5DA] disabled:opacity-30"
                title="重做"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="p-1.5 rounded-lg text-[#6E5D4F] hover:bg-[#EDE5DA] disabled:opacity-30"
                title="清空手绘"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleActive}
                className="ml-1 px-3 py-1 rounded-xl bg-[#5E7A5E] text-white text-xs font-medium hover:bg-[#4E664E] flex items-center space-x-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>完成</span>
              </button>
            </div>
          </div>

          {/* Sliders and color palette */}
          <div className="flex items-center justify-between pt-1 border-t border-[#EDE5DA] gap-2">
            {!isEraser ? (
              <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
                {MORANDI_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 transition-transform ${
                      color === c.hex ? 'border-[#3D3025] scale-110' : 'border-white/80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-[#8C7D70]">橡皮擦模式：轻触或滑动画笔抹除线条</span>
            )}

            {/* Brush width & opacity */}
            <div className="flex items-center space-x-2 text-[11px] text-[#7A6B5E] shrink-0">
              <span>粗细:</span>
              <input
                type="range"
                min="2"
                max="18"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-16 accent-[#736254] cursor-pointer"
              />
              {!isEraser && (
                <>
                  <span className="ml-1">浓度:</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-14 accent-[#736254] cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
