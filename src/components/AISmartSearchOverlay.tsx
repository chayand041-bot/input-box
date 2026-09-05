import React, { useState } from "react";
import { Movie } from "../types";
import { Search, X, Sparkles, Film, ArrowRight, Play, Check, Plus } from "lucide-react";

interface AISmartSearchOverlayProps {
  onClose: () => void;
  catalog: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  myList: string[];
}

interface MatchResult {
  id: string;
  relevanceScore: number;
  aiReason: string;
}

export const AISmartSearchOverlay: React.FC<AISmartSearchOverlayProps> = ({
  onClose,
  catalog,
  onPlayMovie,
  onOpenDetails,
  onToggleMyList,
  myList,
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [matchedMovies, setMatchedMovies] = useState<Array<{ movie: Movie; score: number; reason: string }>>([]);

  const examplePrompts = [
    "Show me action movies with fast cars",
    "Best horror movies in Hindi",
    "Mind-bending sci-fi with time travel",
    "Inspiring real life true stories",
    "Bollywood mass entertainer with revenge plot",
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          catalog: catalog.map((m) => ({
            id: m.id,
            title: m.title,
            genre: m.genre,
            language: m.language,
            year: m.year,
            tags: m.tags,
            synopsis: m.synopsis,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.aiSummary || null);
        setSuggestedTags(data.suggestedTags || []);

        if (data.matches && Array.isArray(data.matches)) {
          const results = data.matches
            .map((m: MatchResult) => {
              const item = catalog.find((c) => c.id === m.id);
              if (!item) return null;
              return {
                movie: item,
                score: m.relevanceScore || 90,
                reason: m.aiReason || "Recommended based on theme match.",
              };
            })
            .filter(Boolean);

          setMatchedMovies(results as any);
        }
      }
    } catch (err) {
      console.error("AI Search Error:", err);
      // Fallback client filter
      const lower = searchQuery.toLowerCase();
      const clientMatched = catalog
        .filter(
          (m) =>
            m.title.toLowerCase().includes(lower) ||
            m.genre.some((g) => g.toLowerCase().includes(lower)) ||
            m.tags.some((t) => t.toLowerCase().includes(lower)) ||
            m.synopsis.toLowerCase().includes(lower)
        )
        .map((m, idx) => ({
          movie: m,
          score: 98 - idx * 4,
          reason: `Matches key theme of "${searchQuery}"`,
        }));

      setMatchedMovies(clientMatched);
      setAiSummary(`Found ${clientMatched.length} titles matching your query.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-search-overlay"
      className="fixed inset-0 z-50 bg-[#0f0f11]/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 lg:p-10 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center text-white font-black text-xs shadow-md shadow-[#E50914]/40">
            IB
          </div>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center">
            <span className="text-[#E50914] mr-1.5">Input Box</span> AI Smart Search
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Search Input */}
      <div className="max-w-5xl mx-auto w-full py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-6 h-6 text-zinc-400" />
            <input
              id="ai-smart-search-input"
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'Show me action movies with fast cars' or 'Best horror movies in Hindi')..."
              className="w-full pl-14 pr-32 py-4 sm:py-5 bg-zinc-900/90 border-2 border-zinc-700/80 focus:border-[#E50914] rounded-2xl text-white text-base sm:text-lg placeholder-zinc-500 focus:outline-none shadow-2xl transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-3 px-5 py-2.5 bg-[#E50914] hover:bg-[#b80710] disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Searching..." : "Ask AI"}</span>
            </button>
          </div>
        </form>

        {/* Quick Example Prompts */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914] mr-1" /> Try:
          </span>
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSearch(prompt)}
              className="px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Interpretation Result Banner */}
        {aiSummary && (
          <div className="mt-6 p-4 rounded-xl bg-zinc-900/80 border border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E50914] flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Semantic Analysis
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">
                  {matchedMovies.length} matching titles
                </span>
              </div>
              <p className="text-sm text-zinc-200 font-medium">{aiSummary}</p>
            </div>

            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {suggestedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Matched Results Grid */}
        {matchedMovies.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold text-white">AI Ranked Matches</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedMovies.map(({ movie, score, reason }) => {
                const inList = myList.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-[#E50914]/50 rounded-xl overflow-hidden p-3 transition-all hover:scale-[1.01] group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Thumbnail */}
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-black mb-3">
                        <img
                          src={movie.backdropUrl || movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          {score}% AI Match
                        </div>
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                          {movie.qualityBadge}
                        </div>
                        <button
                          onClick={() => onPlayMovie(movie)}
                          className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white line-clamp-1">
                          {movie.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span>{movie.rating}</span>
                          <span>•</span>
                          <span>{movie.language}</span>
                        </div>
                        {/* AI Reason for match */}
                        <p className="text-xs text-zinc-300 bg-black/40 p-2 rounded border border-zinc-800/80 line-clamp-2 mt-2">
                          <span className="text-[#E50914] font-semibold mr-1">
                            Why it matches:
                          </span>
                          {reason}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between">
                      <button
                        onClick={() => onPlayMovie(movie)}
                        className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Stream</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleMyList(movie.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            inList
                              ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                              : "border-zinc-700 text-zinc-300 hover:text-white"
                          }`}
                        >
                          {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onOpenDetails(movie)}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
