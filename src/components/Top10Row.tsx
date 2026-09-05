import React, { useRef, useState } from "react";
import { Movie } from "../types";
import { ChevronLeft, ChevronRight, Play, Plus, Check } from "lucide-react";

interface Top10RowProps {
  id: string;
  title: string;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  myList: string[];
}

export const Top10Row: React.FC<Top10RowProps> = ({
  id,
  title,
  movies,
  onPlayMovie,
  onOpenDetails,
  onToggleMyList,
  myList,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const top10Sorted = [...movies]
    .sort((a, b) => (a.top10Rank || 99) - (b.top10Rank || 99))
    .slice(0, 10);

  const handleScroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.75;
    const targetScroll = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
    rowRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  const checkScrollPosition = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <section id={id} className="relative py-6 group/top10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
          <span className="text-[#E50914] mr-2">Top 10</span> {title}
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showLeftArrow && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-[80%] bg-black/60 hover:bg-black/90 text-white flex items-center justify-center rounded-r transition-all backdrop-blur-xs opacity-0 group-hover/top10:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={checkScrollPosition}
          className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {top10Sorted.map((movie, index) => {
            const rank = index + 1;
            const isInMyList = myList.includes(movie.id);

            return (
              <div
                key={movie.id}
                id={`top10-item-${rank}`}
                className="relative flex-none flex items-center group/card cursor-pointer"
                onClick={() => onOpenDetails(movie)}
              >
                {/* Giant Outlined Top 10 Rank Number */}
                <div
                  className="select-none font-black text-7xl sm:text-8xl md:text-9xl leading-none text-black tracking-tighter"
                  style={{
                    WebkitTextStroke: "4px #595959",
                    textShadow: "0 4px 15px rgba(0,0,0,0.8)",
                  }}
                >
                  {rank}
                </div>

                {/* Poster Card Overlapping the Number */}
                <div className="relative -ml-6 sm:-ml-8 w-[120px] sm:w-[140px] md:w-[160px] aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 shadow-xl border border-white/10 group-hover/card:scale-105 group-hover/card:border-[#E50914]/60 transition-all duration-300">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayMovie(movie);
                      }}
                      className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg hover:scale-110 mb-1.5 transition-transform"
                      title="Play Now"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <span className="text-[11px] font-bold text-white line-clamp-1">
                      {movie.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {movie.matchScore}% Match
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-[80%] bg-black/60 hover:bg-black/90 text-white flex items-center justify-center rounded-l transition-all backdrop-blur-xs opacity-0 group-hover/top10:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </section>
  );
};
