import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Disc } from 'lucide-react';

export default function PlayerPreview({
  nowPlaying,
  user,
  isPaused,
  enableScreensaver = true,
  screensaverTimeout = 60, // seconds of inactivity before auto-zoom (kiosk screensaver)
  hasUpcoming = true,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slotRect, setSlotRect] = useState(null);

  const slotRef = useRef(null);
  const iframeRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Update bounding rect of the inline placeholder slot
  const updateSlotRect = useCallback(() => {
    if (slotRef.current) {
      const rect = slotRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSlotRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }, []);

  useEffect(() => {
    updateSlotRect();
    const timer = setTimeout(updateSlotRect, 100);
    window.addEventListener('resize', updateSlotRect);
    window.addEventListener('scroll', updateSlotRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSlotRect);
      window.removeEventListener('scroll', updateSlotRect);
    };
  }, [updateSlotRect]);

  // Keep media inside the preview iframe permanently silent (kiosk preview only)
  const muteMediaInsideIframe = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const media = iframe.contentDocument.querySelectorAll('video, audio');
        media.forEach((el) => {
          el.muted = true;
          el.volume = 0;
        });
      }
    } catch (e) {
      // Cross-origin fallback (same-origin here)
    }
  };

  useEffect(() => {
    const interval = setInterval(muteMediaInsideIframe, 1000);
    return () => clearInterval(interval);
  }, []);

  // Idle timer: inactivity triggers auto-zoom only while a song is playing.
  // Exiting is explicit (tap the screen / Escape).
  useEffect(() => {
    if (!enableScreensaver) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    const handleActivity = (e) => {
      if (e && e.key === 'Escape') {
        setIsFullscreen(false);
        return;
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        if (nowPlaying) setIsFullscreen(true);
      }, screensaverTimeout * 1000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    idleTimerRef.current = setTimeout(() => {
      if (nowPlaying) setIsFullscreen(true);
    }, screensaverTimeout * 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [enableScreensaver, screensaverTimeout, nowPlaying]);

  // When the song ends and nothing is up next, leave fullscreen so the
  // singer can pick a new song.
  useEffect(() => {
    if (!nowPlaying && !hasUpcoming && isFullscreen) setIsFullscreen(false);
  }, [nowPlaying, hasUpcoming, isFullscreen]);

  // Tap the preview itself: zoom in / zoom out. No-op without a song.
  const handlePreviewTap = () => {
    if (!nowPlaying) return;
    setIsFullscreen((prev) => !prev);
  };

  // Smooth expand/contract without unmounting the iframe
  const containerStyle = isFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        zIndex: 99999,
      }
    : slotRect
    ? {
        position: 'fixed',
        top: `${slotRect.top}px`,
        left: `${slotRect.left}px`,
        width: `${slotRect.width}px`,
        height: `${slotRect.height}px`,
        borderRadius: '1rem',
        zIndex: 20,
      }
    : {
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '1rem',
        zIndex: 20,
      };

  return (
    <>
      {/* 1. Slot Placeholder: holds space in the column layout */}
      <div
        ref={slotRef}
        className="w-full aspect-video rounded-2xl bg-ktv-card/40 border border-ktv-border/30 shrink-0"
      />

      {/* 2. Fluid Video Player: tap to zoom in/out */}
      <div
        style={containerStyle}
        className={`overflow-hidden bg-slate-950 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border ${
          isFullscreen ? 'border-transparent' : 'border-ktv-border/80'
        } flex flex-col ${nowPlaying ? 'cursor-pointer' : ''}`}
      >
        {/* Embedded Splash Screen via iframe (never unmounts) */}
        <iframe
          ref={iframeRef}
          src="/splash?muted=1"
          onLoad={muteMediaInsideIframe}
          title="PiKaraoke Live Screen"
          className="w-full h-full border-0 pointer-events-none"
          allow="autoplay; fullscreen"
        />

        {/* Tap-catcher overlay: taps toggle zoom (iframe keeps focus out) */}
        <div
          className="absolute inset-0 z-10"
          onClick={handlePreviewTap}
          title={nowPlaying ? (isFullscreen ? 'Thu nhỏ' : 'Phóng to') : undefined}
        />

        {/* Overlay: Bottom Now Playing Badge */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Disc className={`w-4 h-4 text-ktv-cyan ${!isPaused ? 'animate-spin' : ''}`} />
                <span className="text-[11px] font-bold text-ktv-cyan uppercase tracking-wider">
                  {isPaused ? 'Đang tạm dừng' : 'Đang phát'}
                </span>
              </div>

              <h3 className="font-extrabold text-white text-sm sm:text-base md:text-2xl truncate drop-shadow-md">
                {nowPlaying || 'Chưa có bài hát nào'}
              </h3>

              {user && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Người chọn: <b className="text-white">{user}</b></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}