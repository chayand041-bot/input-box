import React, { useState } from "react";
import { Movie } from "../types";
import { X, Link as LinkIcon, Play, Sparkles, CheckCircle2, Film } from "lucide-react";

interface ExternalStreamModalProps {
  onClose: () => void;
  onPlayStream: (customMovie: Movie) => void;
}

export const ExternalStreamModal: React.FC<ExternalStreamModalProps> = ({
  onClose,
  onPlayStream,
}) => {
  const [streamUrl, setStreamUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Bollywood" | "Hollywood" | "Web Series">("Hollywood");
  const [errorMsg, setErrorMsg] = useState("");

  const sampleStreams = [
    {
      name: "Tears of Steel (Sci-Fi 4K)",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Big Buck Bunny (Animation FHD)",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Elephants Dream (CGI Ultra HD)",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedUrl = streamUrl.trim();
    if (!trimmedUrl) {
      setErrorMsg("Please enter a valid direct media streaming URL.");
      return;
    }

    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      setErrorMsg("URL must start with http:// or https://");
      return;
    }

    const customMovie: Movie = {
      id: `ext-stream-${Date.now()}`,
      title: title.trim() || "External Custom Stream",
      category: category,
      genre: ["External Stream", "Custom Media"],
      year: new Date().getFullYear(),
      rating: "U/A 16+",
      duration: "Live Stream",
      matchScore: 99,
      qualityBadge: "4K UHD",
      synopsis: `Streaming directly from external media server: ${trimmedUrl}. Ingested into Input Box engine with AI auto-quality and real-time buffer management.`,
      aiHook: "Direct ingest stream running buffer-free in Input Box custom player.",
      director: "External Host",
      cast: ["Direct Stream Source"],
      language: "Original Audio",
      tags: ["Direct Media", "External URL", "Custom Stream"],
      posterUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80",
      backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&auto=format&fit=crop&q=80",
      streamUrl: trimmedUrl,
    };

    onPlayStream(customMovie);
    onClose();
  };

  return (
    <div
      id="external-stream-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="external-stream-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#141416] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-[#1c1214] p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Ingest External Media Stream
              </h3>
              <p className="text-xs text-zinc-400">
                Stream any direct MP4, MKV, or web stream without downloading.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Direct Media Source URL *
            </label>
            <input
              id="stream-source-url-input"
              type="url"
              required
              placeholder="https://example.com/stream/video.mp4"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Supports direct MP4 links, MKV web streams, and CDN media servers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Video Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. My Action Movie"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#E50914]"
              >
                <option value="Bollywood">Bollywood</option>
                <option value="Hollywood">Hollywood</option>
                <option value="Web Series">Web Series</option>
              </select>
            </div>
          </div>

          {/* Quick Test Samples */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Quick Test Media Links:
            </label>
            <div className="space-y-1.5">
              {sampleStreams.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => {
                    setStreamUrl(sample.url);
                    setTitle(sample.name);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300 transition-colors"
                >
                  <span className="truncate">{sample.name}</span>
                  <span className="text-[10px] text-[#E50914] font-semibold">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/30 p-2.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#E50914] hover:bg-[#c90711] text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-[#E50914]/40 flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Stream in Input Box Player ▶</span>
          </button>
        </form>
      </div>
    </div>
  );
};
