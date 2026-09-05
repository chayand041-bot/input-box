/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Category, Movie, UserSubscription } from "./types";
import { MOVIES_DATABASE } from "./data/movies";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { MovieRow } from "./components/MovieRow";
import { Top10Row } from "./components/Top10Row";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { AISmartSearchOverlay } from "./components/AISmartSearchOverlay";
import { ExternalStreamModal } from "./components/ExternalStreamModal";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { Footer } from "./components/Footer";
import { Sparkles, Film, Play, Plus, Check } from "lucide-react";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(MOVIES_DATABASE);
  const [currentCategory, setCurrentCategory] = useState<Category>("All");
  const [activeMovieForPlayer, setActiveMovieForPlayer] = useState<Movie | null>(null);
  const [activeMovieForDetails, setActiveMovieForDetails] = useState<Movie | null>(null);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isStreamIngestOpen, setIsStreamIngestOpen] = useState(false);

  // Local storage persistence for My List
  const [myList, setMyList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("inputbox_my_list");
      return saved ? JSON.parse(saved) : ["jawan-2023", "oppenheimer-hindi"];
    } catch {
      return ["jawan-2023", "oppenheimer-hindi"];
    }
  });

  // Local storage persistence for User Subscription
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem("inputbox_subscription");
      return saved
        ? JSON.parse(saved)
        : {
            plan: "none",
            planName: "Free Preview",
            price: 0,
            validDays: 0,
            isVip: false,
          };
    } catch {
      return {
        plan: "none",
        planName: "Free Preview",
        price: 0,
        validDays: 0,
        isVip: false,
      };
    }
  });

  // AI Recommendation Mood
  const [selectedMood, setSelectedMood] = useState<string>("Trending Blockbuster");
  const [aiRecommendations, setAiRecommendations] = useState<Movie[]>([]);
  const [loadingAiRecs, setLoadingAiRecs] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("inputbox_my_list", JSON.stringify(myList));
    } catch (e) {
      console.error(e);
    }
  }, [myList]);

  useEffect(() => {
    try {
      localStorage.setItem("inputbox_subscription", JSON.stringify(subscription));
    } catch (e) {
      console.error(e);
    }
  }, [subscription]);

  // Fetch or filter AI Recommendations based on viewing history and selected mood
  useEffect(() => {
    const controller = new AbortController();

    const fetchRecommendations = async () => {
      setLoadingAiRecs(true);
      try {
        const historyTitles = movies
          .filter((m) => myList.includes(m.id))
          .map((m) => m.title);

        const leanCatalog = movies.map((m) => ({
          id: m.id,
          title: m.title,
          genre: m.genre,
          isAIPick: m.isAIPick,
          isTrending: m.isTrending,
          matchScore: m.matchScore,
        }));

        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            watchHistory: historyTitles,
            mood: selectedMood,
            catalog: leanCatalog,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.recommendedIds && Array.isArray(data.recommendedIds)) {
            const matched = data.recommendedIds
              .map((id: string) => movies.find((m) => m.id === id))
              .filter(Boolean);
            if (matched.length > 0) {
              setAiRecommendations(matched as Movie[]);
              setLoadingAiRecs(false);
              return;
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.warn("[Input Box] Recommendation fallback active:", err?.message || err);
        }
      }

      // Default fallback picks if aborted or empty
      if (!controller.signal.aborted) {
        const fallbackPicks = movies.filter((m) => m.isAIPick);
        setAiRecommendations(fallbackPicks.length > 0 ? fallbackPicks : movies.slice(0, 6));
        setLoadingAiRecs(false);
      }
    };

    fetchRecommendations();

    return () => {
      controller.abort();
    };
  }, [selectedMood, myList.join(","), movies.length]);

  const toggleMyList = (movieId: string) => {
    setMyList((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  const handleActivateSubscription = (newSub: UserSubscription) => {
    setSubscription(newSub);
  };

  const handleIngestCustomStream = (customMovie: Movie) => {
    setMovies((prev) => [customMovie, ...prev]);
    setActiveMovieForPlayer(customMovie);
  };

  // Filter lists
  const heroFeaturedMovie = movies[0]; // Jawan or custom latest
  const trendingNow = movies.filter((m) => m.isTrending);
  const bollywoodBlockbusters = movies.filter((m) => m.isBollywoodBlockbuster);
  const hollywoodHindiDubbed = movies.filter((m) => m.isHollywoodHindiDubbed);
  const webSeries = movies.filter((m) => m.isWebSeries);
  const mySavedMovies = movies.filter((m) => myList.includes(m.id));

  const moods = [
    "Trending Blockbuster",
    "Adrenaline Action",
    "Mind-Bending Sci-Fi",
    "Late Night Mystery",
    "Feel-Good Cinema",
  ];

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col selection:bg-[#E50914] selection:text-white font-sans">
      {/* Sticky Header Navbar */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        onOpenAISearch={() => setIsAISearchOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenStreamIngest={() => setIsStreamIngestOpen(true)}
        subscription={subscription}
        myListCount={myList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {/* If viewing "My List" Category */}
        {currentCategory === "My List" ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              My Watch List
            </h1>
            <p className="text-sm text-zinc-400 mb-8">
              Saved titles ready for streaming on Input Box.
            </p>

            {mySavedMovies.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-600">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-300">
                  Your list is empty
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  Add movies, Bollywood blockbusters, or web series using the "➕ My List" button to watch later.
                </p>
                <button
                  onClick={() => setCurrentCategory("All")}
                  className="px-5 py-2.5 bg-[#E50914] text-white font-bold rounded-lg text-sm"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mySavedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-[#E50914]/60 transition-all group flex flex-col"
                  >
                    <div className="relative aspect-[2/3] bg-zinc-950 overflow-hidden">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setActiveMovieForPlayer(movie)}
                          className="w-10 h-10 rounded-full bg-[#E50914] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white truncate">
                          {movie.title}
                        </h4>
                        <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5 mt-0.5">
                          <span className="text-emerald-400 font-semibold">{movie.matchScore}%</span>
                          <span>•</span>
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span>{movie.qualityBadge}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMyList(movie.id)}
                        className="mt-2 text-xs text-zinc-400 hover:text-[#E50914] flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Home / Category Feed */
          <>
            {/* Cinematic Hero Banner */}
            <HeroBanner
              movie={heroFeaturedMovie}
              onPlayMovie={setActiveMovieForPlayer}
              onOpenDetails={setActiveMovieForDetails}
              onToggleMyList={toggleMyList}
              isInMyList={myList.includes(heroFeaturedMovie.id)}
            />

            {/* AI Mood Selector Pills */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20 mb-4">
              <div className="bg-[#141416]/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#E50914] mr-1" />
                    AI Recommendation Engine:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedMood === mood
                          ? "bg-[#E50914] text-white font-bold shadow-md shadow-[#E50914]/30"
                          : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Slider Rows */}
            <div className="space-y-2 sm:space-y-4">
              {/* AI Recommended For You Row */}
              <MovieRow
                id="ai-recommended-row"
                title="AI Recommended for You"
                subtitle={`Personalized for "${selectedMood}"`}
                isAI={true}
                movies={aiRecommendations}
                onPlayMovie={setActiveMovieForPlayer}
                onOpenDetails={setActiveMovieForDetails}
                onToggleMyList={toggleMyList}
                myList={myList}
              />

              {/* Trending Now */}
              {(currentCategory === "All" || currentCategory === "Bollywood") && (
                <MovieRow
                  id="trending-now-row"
                  title="Trending Now"
                  subtitle="Most watched in India"
                  movies={trendingNow}
                  onPlayMovie={setActiveMovieForPlayer}
                  onOpenDetails={setActiveMovieForDetails}
                  onToggleMyList={toggleMyList}
                  myList={myList}
                />
              )}

              {/* Top 10 Row */}
              {currentCategory === "All" && (
                <Top10Row
                  id="top-10-row"
                  title="Movies & Shows Today"
                  movies={movies}
                  onPlayMovie={setActiveMovieForPlayer}
                  onOpenDetails={setActiveMovieForDetails}
                  onToggleMyList={toggleMyList}
                  myList={myList}
                />
              )}

              {/* Bollywood Blockbusters */}
              {(currentCategory === "All" || currentCategory === "Bollywood") && (
                <MovieRow
                  id="bollywood-row"
                  title="Bollywood Blockbusters"
                  subtitle="Mass action & timeless cinema"
                  movies={bollywoodBlockbusters}
                  onPlayMovie={setActiveMovieForPlayer}
                  onOpenDetails={setActiveMovieForDetails}
                  onToggleMyList={toggleMyList}
                  myList={myList}
                />
              )}

              {/* Hollywood Hindi Dubbed */}
              {(currentCategory === "All" || currentCategory === "Hollywood") && (
                <MovieRow
                  id="hollywood-row"
                  title="Hollywood Hindi Dubbed"
                  subtitle="Sci-Fi epics & explosive thrills"
                  movies={hollywoodHindiDubbed}
                  onPlayMovie={setActiveMovieForPlayer}
                  onOpenDetails={setActiveMovieForDetails}
                  onToggleMyList={toggleMyList}
                  myList={myList}
                />
              )}

              {/* Web Series */}
              {(currentCategory === "All" || currentCategory === "Web Series") && (
                <MovieRow
                  id="web-series-row"
                  title="Web Series & Thrillers"
                  subtitle="Critically acclaimed Indian original series"
                  movies={webSeries}
                  onPlayMovie={setActiveMovieForPlayer}
                  onOpenDetails={setActiveMovieForDetails}
                  onToggleMyList={toggleMyList}
                  myList={myList}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenStreamIngest={() => setIsStreamIngestOpen(true)}
      />

      {/* Full-Screen Video Player Modal */}
      {activeMovieForPlayer && (
        <VideoPlayerModal
          movie={activeMovieForPlayer}
          onClose={() => setActiveMovieForPlayer(null)}
          onOpenStreamIngest={() => {
            setActiveMovieForPlayer(null);
            setIsStreamIngestOpen(true);
          }}
        />
      )}

      {/* Movie Details Modal */}
      {activeMovieForDetails && (
        <MovieDetailsModal
          movie={activeMovieForDetails}
          onClose={() => setActiveMovieForDetails(null)}
          onPlayMovie={(movie) => {
            setActiveMovieForDetails(null);
            setActiveMovieForPlayer(movie);
          }}
          onToggleMyList={toggleMyList}
          isInMyList={myList.includes(activeMovieForDetails.id)}
          similarMovies={movies.filter((m) => m.id !== activeMovieForDetails.id)}
        />
      )}

      {/* Subscription & Scan-to-Pay Modal */}
      {isSubscriptionOpen && (
        <SubscriptionModal
          onClose={() => setIsSubscriptionOpen(false)}
          currentSubscription={subscription}
          onActivateSubscription={handleActivateSubscription}
        />
      )}

      {/* AI Smart Search Overlay */}
      {isAISearchOpen && (
        <AISmartSearchOverlay
          onClose={() => setIsAISearchOpen(false)}
          catalog={movies}
          onPlayMovie={(movie) => {
            setIsAISearchOpen(false);
            setActiveMovieForPlayer(movie);
          }}
          onOpenDetails={(movie) => {
            setIsAISearchOpen(false);
            setActiveMovieForDetails(movie);
          }}
          onToggleMyList={toggleMyList}
          myList={myList}
        />
      )}

      {/* External Stream Ingest Modal */}
      {isStreamIngestOpen && (
        <ExternalStreamModal
          onClose={() => setIsStreamIngestOpen(false)}
          onPlayStream={handleIngestCustomStream}
        />
      )}
    </div>
  );
}
