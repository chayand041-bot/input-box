export type Category =
  | "All"
  | "Bollywood"
  | "Hollywood"
  | "Web Series"
  | "AI Picks"
  | "My List";

export type QualityOption = "auto" | "4k" | "1080p" | "720p" | "480p";

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  category: "Bollywood" | "Hollywood" | "Web Series";
  genre: string[];
  year: number;
  rating: string; // e.g. "U/A 16+", "A", "PG-13"
  duration: string; // e.g. "2h 49m", "3 Seasons"
  matchScore: number; // e.g. 98 (% match)
  qualityBadge: "4K UHD" | "HD" | "HDR";
  synopsis: string;
  aiHook?: string;
  aiVibe?: string;
  director: string;
  cast: string[];
  language: string;
  tags: string[];
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string; // Direct working MP4 / streaming video
  isTrending?: boolean;
  isTop10?: boolean;
  top10Rank?: number;
  isBollywoodBlockbuster?: boolean;
  isHollywoodHindiDubbed?: boolean;
  isWebSeries?: boolean;
  isAIPick?: boolean;
  seasonsCount?: number;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export interface UserSubscription {
  plan: "none" | "weekly" | "monthly";
  planName: string;
  price: number;
  validDays: number;
  activatedAt?: string;
  expiresAt?: string;
  utrNumber?: string;
  userEmail?: string;
  userName?: string;
  isVip: boolean;
}

export interface NetworkHealth {
  speedMbps: number;
  latencyMs: number;
  bufferHealthSeconds: number;
  adjustedQuality: string;
  isBuffering: boolean;
  aiAdjustmentNotice?: string;
}
