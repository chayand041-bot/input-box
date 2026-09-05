import React, { useState } from "react";
import { Movie } from "../types";
import { Play, Plus, Check, Info, Volume2, VolumeX, Sparkles, Flame } from "lucide-react";

interface HeroBannerProps {
  movie: Movie;
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  isInMyList: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onPlayMovie,
  onOpenDetails,
  onToggleMyList,
  isInMyList,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section
      id="hero-banner-section"
      className="relative w-full h-[78vh] sm:h-[84vh] max-h-[880px] min-h-[520px] flex items-end overflow-hidden"
    >
      {/* High-Resolution Cinematic Backdrop */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Cinematic Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f11] via-[#0f0f11]/70 to-transparent max-w-3xl" />
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Banner Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full flex flex-col justify-end">
        <div className="max-w-2xl space-y-4">
          {/* Brand Exclusive & Top 10 Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-[#E50914] text-white text-xs font-black tracking-wider uppercase shadow-md shadow-[#E50914]/40">
              <Flame className="w-3 h-3" />
              <span>Input Box Exclusive</span>
            </span>

            {movie.isTop10 && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-700 text-amber-400 text-xs font-bold">
                <span>#1 in India Today</span>
              </span>
            )}

            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-black/60 border border-white/20 text-zinc-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-[#E50914]" />
              <span>AI Match {movie.matchScore}%</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl uppercase">
            {movie.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-zinc-300">
            <span className="text-emerald-400 font-bold">{movie.matchScore}% Match</span>
            <span>{movie.year}</span>
            <span className="px-1.5 py-0.5 rounded border border-zinc-500 text-[11px] text-zinc-200">
              {movie.rating}
            </span>
            <span>{movie.duration}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold text-[11px]">
              {movie.qualityBadge}
            </span>
            <span className="text-zinc-400 font-normal">| {movie.genre.join(" • ")}</span>
          </div>

          {/* Synopsis & AI Storyline Preview */}
          <p className="text-zinc-200 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
            {movie.synopsis}
          </p>

          {/* AI Hook Highlight */}
          {movie.aiHook && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              <span className="font-semibold text-white">AI Verdict:</span>
              <span className="text-zinc-300 line-clamp-1">{movie.aiHook}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Stream Now button */}
            <button
              id="hero-stream-now-btn"
              onClick={() => onPlayMovie(movie)}
              className="flex items-center space-x-2.5 px-6 py-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-extrabold text-base transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Stream Now</span>
            </button>

            {/* My List button */}
            <button
              id="hero-my-list-btn"
              onClick={() => onToggleMyList(movie.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-bold text-sm transition-all border ${
                isInMyList
                  ? "bg-zinc-800/90 text-emerald-400 border-emerald-500/50"
                  : "bg-zinc-800/80 hover:bg-zinc-700/90 text-white border-zinc-700/70"
              }`}
            >
              {isInMyList ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>My List</span>
                </>
              )}
            </button>

            {/* More Info button */}
            <button
              id="hero-more-info-btn"
              onClick={() => onOpenDetails(movie)}
              className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition-all border border-zinc-700/60"
            >
              <Info className="w-4 h-4 text-zinc-400" />
              <span>More Info</span>
            </button>
          </div>
        </div>

        {/* Right side Sound preview button */}
        <div className="hidden sm:flex absolute right-6 sm:right-10 bottom-16 sm:bottom-24 items-center space-x-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full border border-white/40 bg-black/40 hover:bg-black/70 flex items-center justify-center text-white backdrop-blur-sm transition-transform hover:scale-110"
            title={isMuted ? "Unmute Preview" : "Mute Preview"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="px-2.5 py-1 bg-zinc-900/80 border-l-2 border-[#E50914] text-xs font-semibold text-zinc-300">
            {movie.rating}
          </span>
        </div>
      </div>
    </section>
  );
};
