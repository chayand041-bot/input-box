import React from "react";
import { Movie } from "../types";
import { X, Play, Plus, Check, Sparkles, Star, Film, Calendar, Clock, Globe } from "lucide-react";

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  isInMyList: boolean;
  similarMovies: Movie[];
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onPlayMovie,
  onToggleMyList,
  isInMyList,
  similarMovies,
}) => {
  return (
    <div
      id="movie-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="movie-details-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#141416] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-zinc-800 text-white flex items-center justify-center border border-white/20 transition-transform hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Header */}
        <div className="relative aspect-[16/9] w-full bg-black">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/40 to-transparent" />

          {/* Quick Play CTA on Header */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="space-y-3">
              <span className="px-2.5 py-1 rounded bg-[#E50914] text-white text-[10px] font-black tracking-widest uppercase">
                Input Box Special
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight drop-shadow-lg">
                {movie.title}
              </h2>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => onPlayMovie(movie)}
                  className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-lg text-sm flex items-center space-x-2 transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Stream Now</span>
                </button>

                <button
                  onClick={() => onToggleMyList(movie.id)}
                  className={`p-2.5 rounded-lg border text-sm transition-all ${
                    isInMyList
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-zinc-500 bg-black/60 text-white hover:bg-white/10"
                  }`}
                  title={isInMyList ? "In My List" : "Add to My List"}
                >
                  {isInMyList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-300">
            <span className="text-emerald-400 font-bold">{movie.matchScore}% Match</span>
            <span>{movie.year}</span>
            <span className="px-1.5 py-0.5 rounded border border-zinc-600 text-[11px] text-zinc-200">
              {movie.rating}
            </span>
            <span>{movie.duration}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold text-[11px]">
              {movie.qualityBadge}
            </span>
            <span>{movie.language}</span>
          </div>

          {/* Synopsis & AI Storyline Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed">
                {movie.synopsis}
              </p>

              {/* AI Storyline Hook */}
              {movie.aiHook && (
                <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#E50914] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Cinematic Summary</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-normal">
                    {movie.aiHook}
                  </p>
                  {movie.aiVibe && (
                    <div className="text-[11px] font-semibold text-amber-400 pt-1">
                      Vibe: {movie.aiVibe}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Side Metadata (Cast, Director, Genres) */}
            <div className="space-y-3 text-xs text-zinc-400 border-l border-zinc-800 pl-0 md:pl-6">
              <div>
                <span className="text-zinc-500 block mb-0.5">Director:</span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Cast:</span>
                <span className="text-zinc-200">{movie.cast.join(", ")}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Genres:</span>
                <span className="text-zinc-200">{movie.genre.join(", ")}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Audio & Subtitles:</span>
                <span className="text-zinc-300">
                  Dolby Atmos 5.1, Multi-language AI Subtitles Available
                </span>
              </div>
            </div>
          </div>

          {/* Similar Movies Row */}
          {similarMovies.length > 0 && (
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <h4 className="text-base font-bold text-white flex items-center">
                <Sparkles className="w-4 h-4 text-[#E50914] mr-2" />
                More Like This (AI Recommended)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similarMovies.slice(0, 3).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => {
                      onClose();
                      onPlayMovie(sim);
                    }}
                    className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-[16/9]">
                      <img
                        src={sim.backdropUrl || sim.posterUrl}
                        alt={sim.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-bold text-white truncate">
                        {sim.title}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {sim.matchScore}% Match • {sim.year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
