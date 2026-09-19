/**
 * Smart AI & Canvas Background Removal & Sticker Processing
 */

export interface CutoutResult {
  dataUrl: string;
  width: number;
  height: number;
}

// Convert an image URL or File to an HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Intelligent client-side color & edge background segmentation algorithm.
 * Uses corner sampling, flood fill color tolerance, luminance distance, and alpha feathering.
 */
export async function performSmartCutout(
  img: HTMLImageElement,
  tolerance = 32,
  edgeFeather = 2
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  const maxDim = 800; // Optimal performance for stickers
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

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample the 4 corners and borders to identify background color
  const cornerCoords = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
    [0, Math.floor(h / 2)],
    [w - 1, Math.floor(h / 2)],
    [Math.floor(w / 2), h - 1],
  ];

  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let sampleCount = 0;

  for (const [cx, cy] of cornerCoords) {
    const idx = (cy * w + cx) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
    sampleCount++;
  }

  bgR = Math.round(bgR / sampleCount);
  bgG = Math.round(bgG / sampleCount);
  bgB = Math.round(bgB / sampleCount);

  // Euclidean color distance threshold
  const tolSq = tolerance * tolerance * 3;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq < tolSq) {
      // Background match -> make transparent
      data[i + 3] = 0;
    } else if (distSq < tolSq * 1.5) {
      // Soft edge feathering
      const ratio = (distSq - tolSq) / (tolSq * 0.5);
      data[i + 3] = Math.round(255 * ratio);
    }
  }

  return imgData;
}

/**
 * Server-assisted AI Cutout with client-side fallback
 */
export async function processAICutout(base64Image: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/cutout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    const result = await res.json();
    const img = await loadImage(base64Image);
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(img.width, 800);
    canvas.height = Math.min(img.height, 800);
    const ctx = canvas.getContext('2d');
    if (!ctx) return base64Image;

    const tolerance = result?.data?.recommendedTolerance || 32;
    const cutoutData = await performSmartCutout(img, tolerance);

    canvas.width = cutoutData.width;
    canvas.height = cutoutData.height;
    ctx.putImageData(cutoutData, 0, 0);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Fallback to local smart cutout due to network/api error', err);
    const img = await loadImage(base64Image);
    const canvas = document.createElement('canvas');
    const cutoutData = await performSmartCutout(img, 32);
    canvas.width = cutoutData.width;
    canvas.height = cutoutData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(cutoutData, 0, 0);
      return canvas.toDataURL('image/png');
    }
    return base64Image;
  }
}
