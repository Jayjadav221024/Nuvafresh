import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sparkles } from 'lucide-react';

const OzoneWashingVideoSection = () => {
  const { getContent } = useContent();
  const videoSource = getContent('home.video', 'videoUrl', 'https://assets.mixkit.co/videos/preview/mixkit-farmer-hands-holding-fresh-carrots-41584-large.mp4');
  const posterImg = getContent('home.video', 'posterUrl', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&auto=format&fit=crop&q=80');

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <section className="relative w-full bg-neutral-950 overflow-hidden font-sans border-y border-neutral-800">
      
      {/* 1. Full-Width Video Container */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] lg:h-[75vh] max-h-[800px] flex items-center justify-center bg-black group">
        
        {/* Background Stream Video showing Produce Washing Conveyor */}
        <video
          ref={videoRef}
          src={videoSource}
          poster={posterImg}
          loop
          muted={isMuted}
          autoPlay
          playsInline
          className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
        />

        {/* Subtle Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Top-Right Badge: Active Ozone Chamber */}
        <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Ozone Micro-Bubble Chamber (O₃ Wash)</span>
        </div>

        {/* 2. Floating Minimal Glass Controls (Previous, Play/Pause, Next) matching screenshot */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 bg-black/40 hover:bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 shadow-2xl transition-all duration-300 pointer-events-auto">
            
            {/* Skip Back Button */}
            <button
              onClick={() => handleSeek(-5)}
              className="p-1.5 text-white/80 hover:text-white hover:scale-110 transition-transform"
              title="Rewind 5s"
            >
              <SkipBack className="h-5 w-5 fill-white/80 stroke-none" />
            </button>

            {/* Play / Pause Main Button */}
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:scale-110 transition-transform"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-white stroke-none" />
              ) : (
                <Play className="h-6 w-6 fill-white stroke-none" />
              )}
            </button>

            {/* Skip Forward Button */}
            <button
              onClick={() => handleSeek(5)}
              className="p-1.5 text-white/80 hover:text-white hover:scale-110 transition-transform"
              title="Forward 5s"
            >
              <SkipForward className="h-5 w-5 fill-white/80 stroke-none" />
            </button>

          </div>
        </div>

        {/* Bottom Right Mute/Unmute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-6 right-6 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
        </button>

      </div>
    </section>
  );
};

export default OzoneWashingVideoSection;
