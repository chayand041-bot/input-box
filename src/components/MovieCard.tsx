import React, { useState } from "react";
import { Movie } from "../types";
import { Play, Plus, Check, Info, Sparkles } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  isInMyList: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlayMovie,
  onOpenDetails,
  onToggleMyList,
  isInMyList,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(movie.aiHook || null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Fetch dynamic AI 2-line summary on hover if not yet available
  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (!aiSummary && !loadingAi) {
      setLoadingAi(true);
      try {
        const res = await fetch("/api/ai/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: movie.title,
            synopsis: movie.synopsis,
            genre: movie.genre,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.summary) {
            setAiSummary(data.summary);
          }
        }
      } catch (err) {
        console.error("Failed to load hover AI summary:", err);
      } finally {
        setLoadingAi(false);
      }
    }
  };

  return (
    <div
      id={`movie-card-${movie.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex-none w-[180px] sm:w-[220px] md:w-[250px] aspect-[16/10] rounded-md overflow-visible group cursor-pointer transition-all duration-300"
    >
      {/* Base Card Image */}
      <div className="w-full h-full rounded-md overflow-hidden bg-zinc-900 shadow-md border border-white/5">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Subtle Title Badge on Base Card */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
          <span className="text-xs font-bold text-white truncate max-w-[70%]">
            {movie.title}
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-black/60 px-1 py-0.5 rounded">
            {movie.matchScore}%
          </span>
        </div>
      </div>

      {/* Netflix-Style Hover Card Popup with 2-line AI Storyline Preview */}
      {isHovered && (
        <div
          id={`movie-card-hover-${movie.id}`}
          className="absolute -top-16 -left-4 -right-4 z-50 bg-[#181818] rounded-lg shadow-2xl border border-zinc-700/80 overflow-hidden transform scale-105 transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          {/* Top Video Preview Thumbnail */}
          <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
            
            {/* Quick Play Trigger in Preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayMovie(movie);
                }}
                className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg shadow-[#E50914]/50 hover:scale-110 active:scale-95 transition-transform"
                title="Stream Now"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            </div>

            {/* Quality badge */}
            <span className="absolute top-2 right-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/80 text-white border border-white/20">
              {movie.qualityBadge}
            </span>
          </div>

          {/* Details & AI Summary Body */}
          <div className="p-3 space-y-2.5">
            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPlayMovie(movie)}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors"
                  title="Stream Now"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
                <button
                  onClick={() => onToggleMyList(movie.id)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    isInMyList
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-zinc-500 hover:border-white text-white hover:bg-white/10"
                  }`}
                  title={isInMyList ? "Remove from My List" : "Add to My List"}
                >
                  {isInMyList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => onOpenDetails(movie)}
                className="w-8 h-8 rounded-full border border-zinc-600 hover:border-white text-zinc-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Episode details & full storyline"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Badges */}
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-zinc-300">
              <span className="text-emerald-400 font-bold">{movie.matchScore}% Match</span>
              <span className="border border-zinc-600 px-1 py-0.2 rounded text-[10px] text-zinc-400">
                {movie.rating}
              </span>
              <span>{movie.duration}</span>
              <span className="text-zinc-500">•</span>
              <span>{movie.language}</span>
            </div>

            {/* 2-line AI-generated Storyline Summary Preview */}
            <div className="pt-1 border-t border-zinc-800">
              <div className="flex items-center space-x-1 text-[10px] font-bold text-[#E50914] mb-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>AI Storyline Preview</span>
              </div>
              <p className="text-[11px] text-zinc-300 line-clamp-2 leading-tight">
                {aiSummary || movie.synopsis}
              </p>
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1 text-[10px] text-zinc-400">
              {movie.genre.slice(0, 3).map((g, i) => (
                <span key={g}>
                  {g}
                  {i < Math.min(movie.genre.length, 3) - 1 ? " • " : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
