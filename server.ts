import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payload up to 25MB for image sticker operations
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Initialize Gemini AI with recommended telemetry header
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // AI Sticker Cutout Helper Endpoint
  // Analyzes image subject and provides intelligent bounding polygon / background removal advice
  app.post('/api/ai/cutout', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      if (!ai) {
        // Return structured signal so client executes smart canvas client-side cutout
        return res.json({
          status: 'fallback',
          message: 'Local smart cutout active',
          useClientFallback: true,
        });
      }

      // Clean base64 string
      const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `You are a precision AI sticker cutout assistant. Analyze this photo and locate the primary foreground subject that should be turned into a journal sticker (such as a person, pet, cup of coffee, plant, food, or item).
Return a JSON object with:
1. "subject": brief description of the main subject
2. "box2d": [ymin, xmin, ymax, xmax] coordinates normalized 0-1000 for the main subject bounding box
3. "backgroundColorType": "white" | "dark" | "busy" | "transparent"
4. "dominantSubjectColor": hex color code e.g. "#E0876A"
5. "recommendedTolerance": integer between 15 and 45 for chroma/edge keying
6. "contourPoints": array of approximately 12-20 {x, y} coordinate points (normalized 0-100) tracing the approximate silhouette outline of the subject.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              data: cleanData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { subject: 'Sticker item', useClientFallback: true };
      }

      return res.json({
        status: 'success',
        data: parsed,
      });
    } catch (err: any) {
      console.error('AI Cutout error:', err);
      return res.json({
        status: 'fallback',
        error: err.message || 'AI processing issue, falling back to local smart cutout',
        useClientFallback: true,
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Healing Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
