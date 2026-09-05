import React, { useRef, useState } from "react";
import { Movie } from "../types";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface MovieRowProps {
  id: string;
  title: string;
  subtitle?: string;
  isAI?: boolean;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleMyList: (movieId: string) => void;
  myList: string[];
}

export const MovieRow: React.FC<MovieRowProps> = ({
  id,
  title,
  subtitle,
  isAI,
  movies,
  onPlayMovie,
  onOpenDetails,
  onToggleMyList,
  myList,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  if (!movies.length) return null;

  return (
    <section id={id} className="relative py-4 sm:py-6 group/row">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-baseline justify-between">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
            {isAI && <Sparkles className="w-5 h-5 text-[#E50914] mr-2 inline" />}
            {title}
          </h2>
          {subtitle && (
            <span className="hidden sm:inline text-xs text-zinc-400 font-medium border-l border-zinc-700 pl-2.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-[75%] bg-black/60 hover:bg-black/90 text-white flex items-center justify-center rounded-r transition-all backdrop-blur-xs opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScrollPosition}
          className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto scrollbar-none py-4 px-1 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlayMovie={onPlayMovie}
              onOpenDetails={onOpenDetails}
              onToggleMyList={onToggleMyList}
              isInMyList={myList.includes(movie.id)}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-[75%] bg-black/60 hover:bg-black/90 text-white flex items-center justify-center rounded-l transition-all backdrop-blur-xs opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </section>
  );
};
