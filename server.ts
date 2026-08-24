import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy / safe initialization of Gemini API Client
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SIH26191 Citizen Disaster Response & Safe Relocation System',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side Gemini NLU Voice & Text to Filter extraction
  app.post('/api/parse-resident-voice', async (req, res) => {
    const { transcript, userLocationName } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing transcript string in request body' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Return null so frontend uses deterministic fallback
      return res.json({
        parsed: null,
        message: 'GEMINI_API_KEY not configured on server; using client fallback parser.',
      });
    }

    try {
      const prompt = `You are a disaster response emergency Natural Language Understanding (NLU) parser for citizens in India (rural/urban, multilingual in Hindi, English, Hinglish, Bengali, Marathi, Assamese, Odia, Tamil, Telugu, Gujarati, etc.).
Your ONLY role is to understand the citizen's speech or text request and convert it into structured requirements.
You MUST NOT predict disasters, decide whether an area is safe, invent shelter availability, or automatically choose a location.

Citizen Request: "${transcript}"
Current Resident Location: "${userLocationName || 'India'}"

Extract strictly:
- intent: one of ["relocation", "resource_search", "sos", "hazard_check"]
- people: integer number of people/family members (default to 4 if not specified)
- water_required: boolean (true if water, drinking water, paani is requested or needed)
- medical_required: boolean (true if medical, doctor, medicine, dawa, hospital, injury is mentioned)
- food_required: boolean (true if food, khana, ration, meals is mentioned)
- sanitation_required: boolean (true if toilets, washrooms, sanitation is mentioned)
- safety_required: boolean (true if safe shelter/high ground is requested, defaults to true)
- resource_type: string if looking for a specific resource ("water", "medical", "food", "shelter", "emergency_help", or null)
- extractedLanguage: string (e.g. "Hindi", "English", "Hinglish", "Assamese", "Bengali")

Return ONLY valid structured JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: {
                type: Type.STRING,
                description: 'One of relocation, resource_search, sos, hazard_check',
              },
              people: {
                type: Type.INTEGER,
                description: 'Number of people in group',
              },
              water_required: { type: Type.BOOLEAN },
              medical_required: { type: Type.BOOLEAN },
              food_required: { type: Type.BOOLEAN },
              sanitation_required: { type: Type.BOOLEAN },
              safety_required: { type: Type.BOOLEAN },
              resource_type: {
                type: Type.STRING,
                description: 'water, medical, food, shelter, or emergency_help',
              },
              extractedLanguage: { type: Type.STRING },
            },
            required: [
              'intent',
              'people',
              'water_required',
              'medical_required',
              'food_required',
              'sanitation_required',
              'safety_required',
            ],
          },
        },
      });

      const parsedText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(parsedText);

      return res.json({
        parsed: parsedData,
        source: 'gemini-3.7-flash',
      });
    } catch (error: any) {
      console.error('Error during Gemini NLU parsing:', error);
      return res.json({
        parsed: null,
        error: error.message || 'Gemini extraction failed',
      });
    }
  });

  // Setup Vite or Static File Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Disaster Response App server running on port ${PORT}`);
  });
}

startServer();
