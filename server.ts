import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI server-side client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to call Gemini with automatic fallback to flash-lite if primary model experiences 503 high demand
async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: { contents: string; config?: any },
  primaryModel: string = "gemini-3.8-flash",
  secondaryModel: string = "gemini-3.1-flash-lite"
) {
  try {
    return await ai.models.generateContent({
      ...options,
      model: primaryModel,
    });
  } catch (err: any) {
    const errorStr = String(err?.message || err);
    const isBusyOrUnavailable =
      err?.status === 503 ||
      err?.code === 503 ||
      errorStr.includes("503") ||
      errorStr.includes("high demand") ||
      errorStr.includes("UNAVAILABLE") ||
      errorStr.includes("429");

    if (isBusyOrUnavailable && secondaryModel) {
      console.warn(`[Input Box AI] ${primaryModel} busy/overloaded (503/429). Retrying with ${secondaryModel}...`);
      return await ai.models.generateContent({
        ...options,
        model: secondaryModel,
      });
    }
    throw err;
  }
}

// Intelligent fallback recommendation generator when AI model is undergoing demand spikes
function getFallbackRecommendations(catalog: any[], mood: string = "Trending Blockbuster", watchHistory: string[] = []): { explanation: string; recommendedIds: string[] } {
  const safeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : [];
  
  const moodGenreMap: Record<string, string[]> = {
    "Adrenaline Action": ["Action", "Thriller", "Adventure"],
    "Mind-Bending Sci-Fi": ["Sci-Fi", "Mystery", "Thriller"],
    "Late Night Mystery": ["Mystery", "Thriller", "Crime"],
    "Feel-Good Cinema": ["Comedy", "Drama", "Animation", "Family"],
    "Trending Blockbuster": ["Action", "Blockbuster", "Drama"],
  };

  const targetGenres = moodGenreMap[mood] || ["Action", "Thriller"];

  // Score movies
  const scored = safeCatalog.map((movie: any) => {
    let score = 0;
    const genres: string[] = Array.isArray(movie.genre) ? movie.genre : [];
    
    // Genre alignment
    genres.forEach((g) => {
      if (targetGenres.some((tg) => tg.toLowerCase() === g.toLowerCase())) {
        score += 35;
      }
    });

    if (movie.isAIPick) score += 20;
    if (movie.isTrending) score += 15;
    if (movie.matchScore) score += Math.min(20, movie.matchScore / 5);

    // If already in history, slightly de-prioritize to introduce fresh picks
    if (watchHistory.some((title) => typeof title === "string" && title.toLowerCase() === (movie.title || "").toLowerCase())) {
      score -= 25;
    }

    return { id: movie.id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topIds = scored.slice(0, 6).map((item) => item.id);

  // Fallback if catalog had few items
  const finalIds = topIds.length >= 3 ? topIds : safeCatalog.slice(0, 6).map((m: any) => m.id);

  return {
    explanation: `Personalized for your "${mood}" vibe featuring high-octane blockbusters and trending hits on Input Box.`,
    recommendedIds: finalIds,
  };
}

// Multilingual dialog presets for buffer-free subtitle playback
const MULTILANG_SUBTITLES: Record<string, Array<{ start: number; end: number; text: string }>> = {
  English: [
    { start: 0, end: 5, text: "[Input Box Cinema Audio] - Stream playback active." },
    { start: 5, end: 12, text: "In this world, timing isn't just everything—it's the only thing." },
    { start: 13, end: 20, text: "They said no one could survive this mission. We proved them wrong." },
    { start: 21, end: 28, text: "Hold your positions. Watch the telemetry data closely." },
    { start: 29, end: 38, text: "If we breach the perimeter now, there is no turning back." },
    { start: 39, end: 49, text: "Signal locked! Initiate primary sequence." },
    { start: 50, end: 65, text: "Input Box streaming engine running buffer-free in Ultra High Definition." },
  ],
  Hindi: [
    { start: 0, end: 5, text: "[इनपुट बॉक्स सिनेमा] - स्ट्रीम ऑडियो सक्रिय।" },
    { start: 5, end: 12, text: "इस खेल में सही वक्त ही सब कुछ तय करता है।" },
    { start: 13, end: 20, text: "सबने कहा था कि यह नामुमकिन है, लेकिन हमने करके दिखाया।" },
    { start: 21, end: 28, text: "अपनी जगह पर डटे रहो, टेलीमेट्री सिग्नल पर नजर रखो।" },
    { start: 29, end: 38, text: "अगर हम अब आगे बढ़े, तो पीछे मुड़कर देखने का मौका नहीं मिलेगा।" },
    { start: 39, end: 49, text: "सिग्नल लॉक हो चुका है! ऑपरेशन शुरू करें।" },
    { start: 50, end: 65, text: "इनपुट बॉक्स अल्ट्रा एचडी - बफर फ्री स्ट्रीमिंग सक्रिय।" },
  ],
  Bengali: [
    { start: 0, end: 5, text: "[ইনপুট বক্স সিনেমা] - স্ট্রিম অডিও সক্রিয়।" },
    { start: 5, end: 12, text: "এই দুনিয়ায় সময়টাই সবচেয়ে বড় চালক।" },
    { start: 13, end: 20, text: "তারা বলেছিল কেউ ফিরবে না। আমরা ইতিহাস তৈরি করব।" },
    { start: 21, end: 28, text: "নিজের স্থানে অবিচল থাকো, সিগন্যাল পর্যবেক্ষণ করো।" },
    { start: 29, end: 38, text: "সীমানা পার হলে আর ফেরার কোনো রাস্তা নেই।" },
    { start: 39, end: 49, text: "সিগন্যাল লক! চূড়ান্ত পর্ব শুরু করা হোক।" },
    { start: 50, end: 65, text: "ইনপুট বক্স আল্ট্রা এইচডি প্লেয়ার সচল।" },
  ],
  Spanish: [
    { start: 0, end: 5, text: "[Input Box Cinema] - Transmisión en directo activa." },
    { start: 5, end: 12, text: "En este juego, el tiempo lo es absolutamente todo." },
    { start: 13, end: 20, text: "Dijeron que era imposible sobrevivir a esto. Les demostramos lo contrario." },
    { start: 21, end: 28, text: "Mantengan sus posiciones y vigilen la telemetría." },
    { start: 29, end: 38, text: "Si cruzamos el perímetro ahora, no habrá vuelta atrás." },
    { start: 39, end: 49, text: "¡Señal asegurada! Inicien la secuencia de ataque." },
    { start: 50, end: 65, text: "Input Box streaming sin búfer en Ultra Alta Definición." },
  ],
  French: [
    { start: 0, end: 5, text: "[Cinéma Input Box] - Diffusion en cours." },
    { start: 5, end: 12, text: "Dans ce monde, le timing est absolument tout." },
    { start: 13, end: 20, text: "Ils disaient que c'était impossible. Nous prouvons le contraire." },
    { start: 21, end: 28, text: "Gardez vos positions et surveillez la télémétrie." },
    { start: 29, end: 38, text: "Si nous franchissons cette ligne, il n'y a plus de retour." },
    { start: 39, end: 49, text: "Signal verrouillé ! Lancez la procédure." },
    { start: 50, end: 65, text: "Lecture fluide Ultra HD sur Input Box." },
  ],
  Japanese: [
    { start: 0, end: 5, text: "[Input Box シネマ] - ストリーム音声再生中。" },
    { start: 5, end: 12, text: "この世界では、タイミングこそが全てだ。" },
    { start: 13, end: 20, text: "誰も生き残れないと言われていたが、我々はここにいる。" },
    { start: 21, end: 28, text: "配置につけ。テレメトリ信号を警戒せよ。" },
    { start: 29, end: 38, text: "ここを突破すれば、もう後戻りはできない。" },
    { start: 39, end: 49, text: "シグナル捕捉！作戦シーケンス開始。" },
    { start: 50, end: 65, text: "Input Box ウルトラHD バッファフリー再生。" },
  ],
};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Smart Search Bar endpoint
app.post("/api/ai/search", async (req, res) => {
  const { query, catalog } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Search query is required" });
  }

  const fallbackSearch = () => {
    const lower = query.toLowerCase();
    const filtered = (catalog || [])
      .filter((m: any) =>
        (m.title && m.title.toLowerCase().includes(lower)) ||
        (m.genre && m.genre.some((g: string) => g.toLowerCase().includes(lower))) ||
        (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(lower))) ||
        (m.language && m.language.toLowerCase().includes(lower)) ||
        (m.synopsis && m.synopsis.toLowerCase().includes(lower))
      )
      .slice(0, 10)
      .map((m: any, idx: number) => ({
        id: m.id,
        relevanceScore: Math.max(75, 98 - idx * 4),
        aiReason: `Matches your query "${query}" based on genre, title, and streaming tags.`,
      }));

    return {
      query,
      matches: filtered.length > 0 ? filtered : (catalog || []).slice(0, 6).map((m: any, idx: number) => ({
        id: m.id,
        relevanceScore: 85 - idx * 3,
        aiReason: `Top trending recommendation on Input Box related to "${query}".`,
      })),
      suggestedTags: ["Action", "Trending", "Hindi Dubbed", "4K HDR"],
      aiSummary: filtered.length > 0 ? `Found ${filtered.length} films matching "${query}".` : `Explored catalog recommendations for "${query}".`,
    };
  };

  const ai = getGenAI();
  if (!ai) {
    return res.json(fallbackSearch());
  }

  try {
    const catalogSnippet = (catalog || []).slice(0, 30).map((m: any) => ({
      id: m.id,
      title: m.title,
      genres: m.genre,
      language: m.language,
      year: m.year,
      tags: m.tags,
      synopsis: m.synopsis?.slice(0, 140),
    }));

    const prompt = `You are the intelligent search brain of "Input Box", a premium Netflix-styled movie streaming platform.
User Query: "${query}"

Catalog Snippet:
${JSON.stringify(catalogSnippet)}

Analyze the user's natural language request (detect intent like mood, language, pace, actors, themes).
Match the best fitting items from the catalog. Also provide 3 smart category tags and a concise 1-sentence AI search summary.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiSummary: {
              type: Type.STRING,
              description: "A friendly 1-line summary of what was found based on the user's intent.",
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 refined search tags or filters.",
            },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER, description: "Match score between 70 and 99" },
                  aiReason: { type: Type.STRING, description: "Brief explanation of why this matches the user query" },
                },
                required: ["id", "relevanceScore", "aiReason"],
              },
            },
          },
          required: ["aiSummary", "suggestedTags", "matches"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      query,
      aiSummary: parsed.aiSummary || `Found recommendations for "${query}"`,
      suggestedTags: parsed.suggestedTags || ["Blockbuster", "Top Rated"],
      matches: parsed.matches || [],
    });
  } catch (error) {
    console.warn("[Input Box AI Search] AI temporary limitation, switching to fallback search:", error instanceof Error ? error.message : error);
    return res.json(fallbackSearch());
  }
});

// AI Recommendation Engine endpoint
app.post("/api/ai/recommend", async (req, res) => {
  const { watchHistory, mood, catalog } = req.body;
  const fallback = getFallbackRecommendations(catalog, mood, watchHistory);
  const ai = getGenAI();

  if (!ai) {
    return res.json(fallback);
  }

  try {
    const prompt = `User watch history titles: ${JSON.stringify(watchHistory || ["Oppenheimer", "Jawan"])}
User chosen mood or vibe: ${mood || "Trending Blockbuster"}
Available Catalog: ${JSON.stringify((catalog || []).slice(0, 25).map((m: any) => ({ id: m.id, title: m.title, genre: m.genre })))}

Return a list of top 6 recommended movie IDs from the catalog with a personalized reason for the recommendation.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["explanation", "recommendedIds"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (parsed && Array.isArray(parsed.recommendedIds) && parsed.recommendedIds.length > 0) {
      return res.json(parsed);
    }
    return res.json(fallback);
  } catch (error) {
    // Model 503 high demand or temporary network spike: gracefully serve curated heuristic recommendations
    console.warn("[Input Box AI Recommend] High demand spike handled gracefully with smart curated picks:", error instanceof Error ? error.message : error);
    return res.json(fallback);
  }
});

// AI Movie Summary Preview endpoint (Instant 2-line AI-generated storyline summary)
app.post("/api/ai/summary", async (req, res) => {
  const { title, synopsis, genre } = req.body;
  const fallbackSummary = {
    summary: synopsis
      ? synopsis.slice(0, 160) + (synopsis.length > 160 ? "..." : "")
      : `An exhilarating ${genre?.[0] || "cinematic"} experience packed with high-stakes tension and unforgettable performances.`,
    hook: "Stream in Ultra HD with crystal-clear 5.1 surround sound on Input Box.",
    vibe: `${genre?.[0] || "Epic"} • ${genre?.[1] || "Thrilling"} • High Octane`,
  };

  const ai = getGenAI();
  if (!ai) {
    return res.json(fallbackSummary);
  }

  try {
    const prompt = `Movie Title: "${title}"
Genres: ${JSON.stringify(genre || [])}
Base Synopsis: "${synopsis || ""}"

Write an ultra-captivating 2-line AI storyline summary hook for a Netflix-styled preview card tooltip on "Input Box". 
Also provide a 3-word vibe tag line.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Exactly 2 captivating sentences explaining the story hook." },
            hook: { type: Type.STRING, description: "One punchy reason to stream right now." },
            vibe: { type: Type.STRING, description: "Vibe tags e.g. 'Mind-Bending • Visually Stunning'" },
          },
          required: ["summary", "hook", "vibe"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.warn("[Input Box AI Summary] Serving fallback synopsis:", error instanceof Error ? error.message : error);
    return res.json(fallbackSummary);
  }
});

// AI Auto-Subtitles & Translator endpoint
app.post("/api/ai/subtitles", async (req, res) => {
  const { movieTitle, language = "English" } = req.body;
  const fallbackSubtitles = MULTILANG_SUBTITLES[language] || MULTILANG_SUBTITLES.English;

  const ai = getGenAI();
  if (!ai) {
    return res.json({
      language,
      subtitles: fallbackSubtitles,
      note: "Standard multi-language stream active.",
    });
  }

  try {
    const prompt = `You are the AI Auto-Subtitles & Translator engine for the video player on "Input Box".
Movie: "${movieTitle}"
Target Language: "${language}"

Generate 7 timed cinematic dialogue subtitle lines translated and rendered accurately in ${language} (with appropriate script/alphabet if Hindi, Bengali, Spanish, French, Japanese, etc.).
Provide start seconds, end seconds (from 0 to 65 seconds), and the dialogue text.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtitles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.NUMBER },
                  end: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                },
                required: ["start", "end", "text"],
              },
            },
          },
          required: ["subtitles"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      language,
      subtitles: parsed.subtitles?.length ? parsed.subtitles : fallbackSubtitles,
    });
  } catch (error) {
    console.warn("[Input Box Subtitles] Serving synchronized multilingual subtitles:", error instanceof Error ? error.message : error);
    return res.json({
      language,
      subtitles: fallbackSubtitles,
    });
  }
});

// Vite middleware in dev / static in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Input Box Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
