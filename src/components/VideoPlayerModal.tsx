import React, { useState, useRef, useEffect } from "react";
import { Movie, QualityOption, SubtitleCue } from "../types";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  Sparkles,
  Wifi,
  Gauge,
  Tv,
  Check,
  Link as LinkIcon,
} from "lucide-react";

interface VideoPlayerModalProps {
  movie: Movie;
  onClose: () => void;
  onOpenStreamIngest: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  onClose,
  onOpenStreamIngest,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  // Timeline hover tooltip
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Menus
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // AI Auto-Quality & Buffer Control
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>("auto");
  const [effectiveQuality, setEffectiveQuality] = useState("1080p FHD");
  const [networkSpeedMbps, setNetworkSpeedMbps] = useState(42.6);
  const [bufferHealthSeconds, setBufferHealthSeconds] = useState(18.4);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // AI Auto-Subtitles & Translator
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("");
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([
    { start: 0, end: 5, text: `[Input Box Cinema Audio] - Now streaming: ${movie.title}` },
    { start: 5, end: 12, text: "In this world, timing isn't just everything—it's the only thing." },
    { start: 13, end: 20, text: "They said no one could survive this mission. We proved them wrong." },
    { start: 21, end: 28, text: "Hold your positions. Watch the telemetry data closely." },
    { start: 29, end: 38, text: "If we breach the perimeter now, there is no turning back." },
    { start: 39, end: 49, text: "Signal locked! Initiate playback sequence." },
    { start: 50, end: 65, text: "Input Box streaming engine running buffer-free in Ultra High Definition." },
  ]);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Activity handler for auto-hiding controls
  const handleUserActivity = () => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
        setShowSubtitleMenu(false);
        setShowSpeedMenu(false);
      }
    }, 3200);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skip(-10);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skip(10);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setSubtitlesEnabled((prev) => !prev);
      } else if (e.key === "Escape") {
        if (!document.fullscreenElement) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen]);

  // Video time & buffer tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Update active subtitle cue
    if (subtitlesEnabled && subtitleCues.length) {
      const active = subtitleCues.find((cue) => cur >= cue.start && cur <= cue.end);
      setCurrentSubtitleText(active ? active.text : "");
    } else {
      setCurrentSubtitleText("");
    }

    // Update buffer end
    if (videoRef.current.buffered.length > 0) {
      const lastBuffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedEnd(lastBuffered);
      const remainingBuffer = Math.max(0, lastBuffered - cur);
      setBufferHealthSeconds(Number(remainingBuffer.toFixed(1)));
    }
  };

  // Simulate AI Auto-Quality network speed & buffer adjustment
  useEffect(() => {
    const interval = setInterval(() => {
      // Small simulated variation in network speed
      const fluctuation = (Math.random() - 0.5) * 6;
      const newSpeed = Math.max(12, Math.min(95, networkSpeedMbps + fluctuation));
      setNetworkSpeedMbps(Number(newSpeed.toFixed(1)));

      if (selectedQuality === "auto") {
        if (newSpeed > 45) {
          setEffectiveQuality("4K Ultra HD");
        } else if (newSpeed > 25) {
          setEffectiveQuality("1080p FHD");
        } else if (newSpeed > 15) {
          setEffectiveQuality("720p HD");
        } else {
          setEffectiveQuality("480p SD");
        }
      } else {
        const labels: Record<QualityOption, string> = {
          auto: "Auto AI",
          "4k": "4K Ultra HD",
          "1080p": "1080p FHD",
          "720p": "720p HD",
          "480p": "480p SD",
        };
        setEffectiveQuality(labels[selectedQuality]);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [selectedQuality, networkSpeedMbps]);

  // Trigger AI Subtitles generation via server API when language changes
  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    setShowSubtitleMenu(false);
    setIsGeneratingSubtitles(true);
    setAiNotice(`AI generating real-time ${lang} subtitles...`);

    try {
      const res = await fetch("/api/ai/subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle: movie.title,
          language: lang,
          currentSeconds: currentTime,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.subtitles && Array.isArray(data.subtitles)) {
          setSubtitleCues(data.subtitles);
          setAiNotice(`AI ${lang} subtitles synchronized.`);
          setTimeout(() => setAiNotice(null), 3500);
        }
      }
    } catch (err) {
      console.error("Failed to load AI subtitles:", err);
      setAiNotice("Using standard subtitle stream.");
      setTimeout(() => setAiNotice(null), 2500);
    } finally {
      setIsGeneratingSubtitles(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    videoRef.current.muted = next;
  };

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    setVolume(newVol);
    videoRef.current.volume = newVol;
    if (newVol === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const handleSpeedChange = (spd: number) => {
    if (!videoRef.current) return;
    setPlaybackSpeed(spd);
    videoRef.current.playbackRate = spd;
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Timeline scrubbing
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(pct * duration);
    setHoverPosition(hoverX);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  const languages = [
    { name: "English", native: "English" },
    { name: "Hindi", native: "हिंदी" },
    { name: "Bengali", native: "বাংলা" },
    { name: "Spanish", native: "Español" },
    { name: "French", native: "Français" },
    { name: "Japanese", native: "日本語" },
  ];

  return (
    <div
      ref={containerRef}
      id="video-player-fullscreen-container"
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Native HTML5 Video Element */}
      <video
        ref={videoRef}
        id="inputbox-html5-video"
        src={movie.streamUrl}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.volume = volume;
            videoRef.current.play().catch(() => setIsPlaying(false));
          }
        }}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* AI Subtitle Overlay */}
      {subtitlesEnabled && currentSubtitleText && (
        <div className="absolute bottom-20 sm:bottom-28 inset-x-0 flex justify-center pointer-events-none px-4 z-30">
          <div className="bg-black/75 px-4 py-1.5 rounded-md backdrop-blur-xs text-white text-center font-medium text-base sm:text-xl lg:text-2xl tracking-wide max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all">
            {currentSubtitleText}
          </div>
        </div>
      )}

      {/* AI Dynamic Notice Toast */}
      {aiNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2 bg-zinc-900/90 border border-[#E50914]/50 px-4 py-2 rounded-full text-xs sm:text-sm text-zinc-100 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-[#E50914] animate-spin" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-40 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            id="video-player-close-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-white transition-transform hover:scale-105"
            title="Exit Player (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-[#E50914] tracking-widest uppercase">
                Input Box Cinema
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-semibold">
                {movie.qualityBadge}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white line-clamp-1">
              {movie.title}
            </h2>
          </div>
        </div>

        {/* Top Right: External Ingest & Network Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenStreamIngest}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/70 text-zinc-300 hover:text-white text-xs font-medium transition-all"
            title="Stream another direct link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Ingest Media Link</span>
          </button>

          {/* AI Buffer & Network Health Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 border border-zinc-800 text-xs text-zinc-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] text-emerald-400">
              {networkSpeedMbps} Mbps
            </span>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden md:inline text-[11px] text-zinc-300">
              Buffer: {bufferHealthSeconds}s
            </span>
          </div>
        </div>
      </div>

      {/* Center Large Play/Pause Toggle Indicator on click */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute z-30 w-20 h-20 rounded-full bg-[#E50914]/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
        >
          <Play className="w-10 h-10 fill-current ml-1" />
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col space-y-3 transition-opacity duration-300 z-40 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Netflix Dark Red Seek Progress Bar */}
        <div
          ref={timelineRef}
          id="netflix-progress-bar-container"
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-3 sm:h-3.5 flex items-center cursor-pointer group/timeline py-2"
        >
          {/* Background Bar */}
          <div className="w-full h-1 sm:h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
            {/* Buffer Progress Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-zinc-600/70 transition-all duration-200"
              style={{ width: `${bufferPercent}%` }}
            />
            {/* Played Progress Bar in Netflix Red #E50914 */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-[#E50914] transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Knob */}
          <div
            className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#E50914] shadow-md border-2 border-white scale-0 group-hover/timeline:scale-100 transition-transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-1 bg-zinc-900 text-white text-xs font-mono rounded border border-zinc-700 pointer-events-none -translate-x-1/2 shadow-lg"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Bottom Action Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls: Play/Pause, Skip 10s, Volume, Timecode */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              id="player-play-pause-btn"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => skip(-10)}
              className="text-zinc-300 hover:text-white transition-colors"
              title="Rewind 10 seconds (Left Arrow)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => skip(10)}
              className="text-zinc-300 hover:text-white transition-colors"
              title="Fast forward 10 seconds (Right Arrow)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-zinc-300 hover:text-white transition-colors"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 accent-[#E50914] bg-zinc-700 rounded-lg cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Timecode */}
            <div className="text-xs sm:text-sm font-mono text-zinc-300 pl-1">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span className="text-zinc-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: AI Quality, AI Subtitles, Speed, Fullscreen */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {/* AI Auto-Quality & Buffer Control Menu */}
            <div className="relative">
              <button
                id="player-quality-toggle-btn"
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSubtitleMenu(false);
                  setShowSpeedMenu(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  selectedQuality === "auto"
                    ? "bg-[#E50914]/20 border-[#E50914] text-white"
                    : "bg-zinc-900/80 border-zinc-700 text-zinc-200"
                }`}
                title="AI Auto-Quality & Buffer Control"
              >
                <Gauge className="w-3.5 h-3.5 text-[#E50914]" />
                <span className="hidden sm:inline">{effectiveQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute right-0 bottom-12 w-64 bg-[#181818] border border-zinc-700 rounded-lg shadow-2xl p-3 space-y-2 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="font-bold text-white flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#E50914] mr-1.5" />
                      AI Buffer & Quality
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {networkSpeedMbps} Mbps
                    </span>
                  </div>

                  <div className="space-y-1">
                    {[
                      { key: "auto", label: "Auto (AI Smart Adaptive)", desc: "Dynamically prevents buffering" },
                      { key: "4k", label: "4K Ultra HD (2160p)", desc: "Crystal clear premium resolution" },
                      { key: "1080p", label: "1080p Full HD", desc: "Crisp theater fidelity" },
                      { key: "720p", label: "720p HD", desc: "Data saver for mobile connections" },
                      { key: "480p", label: "480p SD", desc: "Ultra-low bandwidth mode" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSelectedQuality(opt.key as QualityOption);
                          setShowQualityMenu(false);
                          setAiNotice(`Quality set to ${opt.label}`);
                          setTimeout(() => setAiNotice(null), 2500);
                        }}
                        className={`w-full text-left p-2 rounded flex items-center justify-between transition-colors ${
                          selectedQuality === opt.key
                            ? "bg-[#E50914]/20 text-white font-bold border border-[#E50914]/40"
                            : "hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        <div>
                          <div>{opt.label}</div>
                          <div className="text-[10px] text-zinc-400 font-normal">
                            {opt.desc}
                          </div>
                        </div>
                        {selectedQuality === opt.key && (
                          <Check className="w-4 h-4 text-[#E50914]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Auto-Subtitles & Multi-Language Translator Menu */}
            <div className="relative">
              <button
                id="player-subtitles-toggle-btn"
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowQualityMenu(false);
                  setShowSpeedMenu(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  subtitlesEnabled
                    ? "bg-[#E50914]/20 border-[#E50914] text-white"
                    : "bg-zinc-900/80 border-zinc-700 text-zinc-400"
                }`}
                title="AI Auto-Subtitles & Language Translator"
              >
                <Subtitles className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {subtitlesEnabled ? selectedLanguage : "Off"}
                </span>
              </button>

              {showSubtitleMenu && (
                <div className="absolute right-0 bottom-12 w-64 bg-[#181818] border border-zinc-700 rounded-lg shadow-2xl p-3 space-y-2 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="font-bold text-white flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#E50914] mr-1.5" />
                      AI Subtitles & Translator
                    </span>
                    <button
                      onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        subtitlesEnabled ? "bg-[#E50914] text-white" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {subtitlesEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400">
                    Powered by Gemini AI to translate and generate synchronized subtitles on-the-fly.
                  </p>

                  <div className="space-y-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.name}
                        onClick={() => handleLanguageChange(lang.name)}
                        className={`w-full text-left p-2 rounded flex items-center justify-between transition-colors ${
                          subtitlesEnabled && selectedLanguage === lang.name
                            ? "bg-[#E50914]/20 text-white font-bold border border-[#E50914]/40"
                            : "hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        <span>
                          {lang.name}{" "}
                          <span className="text-zinc-500 text-[11px]">
                            ({lang.native})
                          </span>
                        </span>
                        {subtitlesEnabled && selectedLanguage === lang.name && (
                          <Check className="w-4 h-4 text-[#E50914]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                  setShowSubtitleMenu(false);
                }}
                className="px-2 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-12 w-28 bg-[#181818] border border-zinc-700 rounded-lg shadow-2xl p-2 space-y-1 z-50 text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                        playbackSpeed === spd
                          ? "bg-[#E50914] text-white font-bold"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {spd === 1 ? "1.0x (Normal)" : `${spd}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              id="player-fullscreen-btn"
              onClick={toggleFullscreen}
              className="text-zinc-300 hover:text-white p-1 transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
