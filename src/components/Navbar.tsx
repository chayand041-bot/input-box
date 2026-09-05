import React, { useState } from "react";
import { Category, UserSubscription } from "../types";
import { Search, Bell, Sparkles, Link as LinkIcon, Crown, Film, Menu, X } from "lucide-react";

interface NavbarProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
  onOpenAISearch: () => void;
  onOpenSubscription: () => void;
  onOpenStreamIngest: () => void;
  subscription: UserSubscription;
  myListCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenAISearch,
  onOpenSubscription,
  onOpenStreamIngest,
  subscription,
  myListCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories: { label: string; value: Category }[] = [
    { label: "Home", value: "All" },
    { label: "Bollywood", value: "Bollywood" },
    { label: "Hollywood", value: "Hollywood" },
    { label: "Web Series", value: "Web Series" },
    { label: "AI Picks", value: "AI Picks" },
    { label: `My List (${myListCount})`, value: "My List" },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0f0f11]/95 backdrop-blur-md shadow-2xl border-b border-white/5 py-3"
          : "bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Red Brand Logo + Navigation Links */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <button
            id="brand-logo-btn"
            onClick={() => onSelectCategory("All")}
            className="flex items-center space-x-2.5 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#E50914] rounded flex items-center justify-center shadow-lg shadow-[#E50914]/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] uppercase drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)]">
              Input Box
            </span>
          </button>

          {/* Desktop Categories */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {categories.map((cat) => {
              const active = currentCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  id={`nav-link-${cat.value.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => onSelectCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "text-white bg-white/15 shadow-sm font-semibold"
                      : "text-zinc-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions (AI Search, Stream Ingest, Subscription, Profile) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AI Smart Search Trigger */}
          <button
            id="navbar-ai-search-btn"
            onClick={onOpenAISearch}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-sm font-medium transition-all group hover:border-[#E50914]/50 shadow-inner"
            title="Open AI Smart Search (Natural Language)"
          >
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-[#E50914] transition-colors" />
            <span className="hidden sm:inline text-xs text-zinc-300">
              AI Smart Search
            </span>
            <span className="flex items-center space-x-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] font-semibold border border-[#E50914]/30">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI
            </span>
          </button>

          {/* External Stream Ingest Button */}
          <button
            id="navbar-stream-ingest-btn"
            onClick={onOpenStreamIngest}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-medium transition-all hover:border-zinc-500"
            title="Ingest external MP4/MKV/Stream URL"
          >
            <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Play Stream URL</span>
          </button>

          {/* Subscription / Plan Activation Button */}
          <button
            id="navbar-subscribe-btn"
            onClick={onOpenSubscription}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
              subscription.isVip
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/20 hover:brightness-110"
                : "bg-[#E50914] hover:bg-[#b80710] text-white shadow-[#E50914]/30 hover:scale-105"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>
              {subscription.isVip ? "VIP PRO (Active)" : "Subscribe ₹10"}
            </span>
          </button>

          {/* User Profile Avatar with VIP ring */}
          <div
            id="navbar-user-avatar"
            onClick={onOpenSubscription}
            className="cursor-pointer relative group flex items-center"
            title={subscription.isVip ? "Active VIP Account" : "Click to Upgrade Plan"}
          >
            <div
              className={`w-8 h-8 rounded overflow-hidden border-2 ${
                subscription.isVip ? "border-amber-400" : "border-zinc-700"
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {subscription.isVip && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 border border-black rounded-full" />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#141414] border-b border-zinc-800 px-4 pt-3 pb-5 space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                onSelectCategory(cat.value);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded text-sm font-medium ${
                currentCategory === cat.value
                  ? "bg-[#E50914] text-white font-bold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenStreamIngest();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-zinc-400 flex items-center space-x-1.5 py-1"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Ingest Stream URL</span>
            </button>
            <button
              onClick={() => {
                onOpenSubscription();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-amber-400 font-semibold"
            >
              {subscription.isVip ? "VIP Plan Active" : "Scan to Pay (₹10 / ₹50)"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
