import React from "react";
import { Film, Globe } from "lucide-react";

interface FooterProps {
  onOpenSubscription: () => void;
  onOpenStreamIngest: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSubscription,
  onOpenStreamIngest,
}) => {
  return (
    <footer
      id="main-footer"
      className="border-t border-zinc-800/80 bg-[#0f0f11] pt-12 pb-16 text-zinc-400 text-xs mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Brand & Mission Statement */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-[#E50914] rounded flex items-center justify-center shadow-md shadow-[#E50914]/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-black text-[#E50914] uppercase tracking-tighter">
              Input Box
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenSubscription}
              className="text-xs text-white hover:text-[#E50914] transition-colors font-semibold"
            >
              Subscription Plans (₹10 / ₹50)
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={onOpenStreamIngest}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              External Stream Ingest
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div className="space-y-2.5">
            <h5 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Navigation</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#trending-now-row" className="hover:underline">Trending Now</a></li>
              <li><a href="#bollywood-row" className="hover:underline">Bollywood Blockbusters</a></li>
              <li><a href="#hollywood-row" className="hover:underline">Hollywood Hindi Dubbed</a></li>
              <li><a href="#web-series-row" className="hover:underline">Web Series & Thrillers</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Smart AI Engine</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><span className="hover:text-zinc-200 cursor-pointer">AI Recommendations</span></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Natural Language Search</span></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Dynamic Multi-Lang Subtitles</span></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Auto-Quality Buffer Prevention</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Help & Payment</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><button onClick={onOpenSubscription} className="hover:underline text-left">Scan-to-Pay UPI Setup</button></li>
              <li><button onClick={onOpenSubscription} className="hover:underline text-left">12-Digit UTR Verification</button></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Supported Devices & TV</span></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Network Speed Test</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Platform</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><span className="hover:text-zinc-200 cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-zinc-200 cursor-pointer">Cookie Preferences</span></li>
              <li><span className="text-emerald-400 font-semibold">Live Server: 100% Operational</span></li>
            </ul>
          </div>
        </div>

        {/* Language selector & copyright */}
        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-xs text-zinc-300">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>English (India)</span>
          </div>

          <p className="text-zinc-500 text-[11px] text-center sm:text-right">
            © {new Date().getFullYear()} Input Box Streaming Media Inc. All rights reserved. Powered by Google AI Studio & Gemini.
          </p>
        </div>
      </div>
    </footer>
  );
};
