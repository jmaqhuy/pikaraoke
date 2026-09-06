import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Minus,
  Plus,
} from 'lucide-react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PlaybackControls({
  playback,
  position,
  onTogglePause,
  onSkip,
  onRestart,
  onVolumeChange,
  onTransposeChange,
}) {
  const hasSong = Boolean(playback.now_playing);
  const isPaused = playback.is_paused ?? true;
  const duration = playback.now_playing_duration || 0;
  const volume = playback.volume ?? 0.85;
  const currentTranspose = playback.now_playing_transpose ?? 0;

  const [localTranspose, setLocalTranspose] = useState(currentTranspose);
  const [showVolume, setShowVolume] = useState(false);
  const applyTimerRef = useRef(null);
  const volumeBoxRef = useRef(null);

  useEffect(() => {
    setLocalTranspose(currentTranspose);
  }, [currentTranspose]);

  // Tone changes apply automatically once the user stops tapping
  const changeTone = (delta) => {
    const next = Math.max(-6, Math.min(6, localTranspose + delta));
    setLocalTranspose(next);
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      onTransposeChange(next);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    };
  }, []);

  // Close the volume popover when tapping elsewhere
  useEffect(() => {
    if (!showVolume) return;
    const handleDown = (e) => {
      if (volumeBoxRef.current && !volumeBoxRef.current.contains(e.target)) {
        setShowVolume(false);
      }
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('touchstart', handleDown);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('touchstart', handleDown);
    };
  }, [showVolume]);

  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  const tonePending = localTranspose !== currentTranspose;

  const disabledClass = 'disabled:opacity-40 disabled:pointer-events-none';

  return (
    <div className="flex flex-col gap-1.5 p-2 sm:p-2.5 bg-ktv-card/90 border border-ktv-border rounded-2xl">
      {/* Slim Progress Bar */}
      <div className="flex items-center gap-2 h-3">
        <span className="text-[10px] font-mono font-bold text-ktv-cyan w-9 text-right">
          {formatTime(position)}
        </span>
        <div className="flex-1 h-1 bg-ktv-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ktv-purple via-indigo-500 to-ktv-cyan transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 w-9">
          {formatTime(duration)}
        </span>
      </div>

      {/* Single-row controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onRestart}
          disabled={!hasSong}
          className={`w-9 h-10 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover active:bg-slate-700 text-slate-200 hover:text-white border border-ktv-border flex items-center justify-center transition-all touch-press shrink-0 ${disabledClass}`}
          title="Hát lại từ đầu"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
        </button>

        <button
          type="button"
          onClick={onTogglePause}
          disabled={!hasSong}
          className={`flex-[1.3] h-10 rounded-xl flex items-center justify-center gap-1.5 px-2 font-black text-xs sm:text-sm transition-all touch-press shrink-0 ${disabledClass} ${
            isPaused
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50'
          }`}
          title={isPaused ? 'Tiếp tục phát' : 'Tạm dừng'}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span className="truncate">Phát tiếp</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span className="truncate">Tạm dừng</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={!hasSong}
          className={`flex-1 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5 px-2 text-xs sm:text-sm font-black transition-all touch-press ${disabledClass}`}
          title="Bỏ qua bài này để hát bài tiếp theo"
        >
          <SkipForward className="w-4 h-4" />
          <span className="truncate">Qua bài</span>
        </button>

        {/* Volume: one button, tap opens a vertical slider */}
        <div ref={volumeBoxRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowVolume((v) => !v)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all touch-press ${
              showVolume
                ? 'bg-ktv-purple border-ktv-purple text-white'
                : 'bg-ktv-surface/60 border-ktv-border/40 text-slate-300 hover:text-white'
            }`}
            title={`Âm lượng: ${Math.round(volume * 100)}%`}
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 z-50 p-2.5 rounded-2xl bg-ktv-card border border-ktv-border shadow-2xl flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-300">
                {Math.round(volume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="h-24 w-7 accent-ktv-cyan cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
                title={`Âm lượng: ${Math.round(volume * 100)}%`}
              />
            </div>
          )}
        </div>

        {/* Tone */}
        <div
          className="flex items-center gap-0.5 px-1 h-10 rounded-xl bg-ktv-surface/60 border border-ktv-border/40 shrink-0"
          title="Đổi tone (giọng) của bài hát"
        >
          <span className="text-[9px] font-black uppercase tracking-wide text-slate-400 pl-1">
            Tone
          </span>
          <button
            type="button"
            onClick={() => changeTone(-1)}
            disabled={!hasSong}
            className={`w-6 h-6 rounded-lg hover:bg-ktv-hover active:bg-slate-700 flex items-center justify-center text-slate-200 touch-press ${disabledClass}`}
            title="Hạ tone"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span
            className={`w-5 text-center font-mono font-bold text-xs ${
              tonePending
                ? 'text-ktv-amber animate-pulse'
                : localTranspose !== 0
                ? 'text-ktv-amber'
                : 'text-slate-300'
            }`}
          >
            {localTranspose > 0 ? `+${localTranspose}` : localTranspose}
          </span>
          <button
            type="button"
            onClick={() => changeTone(1)}
            disabled={!hasSong}
            className={`w-6 h-6 rounded-lg hover:bg-ktv-hover active:bg-slate-700 flex items-center justify-center text-slate-200 touch-press ${disabledClass}`}
            title="Tăng tone"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}