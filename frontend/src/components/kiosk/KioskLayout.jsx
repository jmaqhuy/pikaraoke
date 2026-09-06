import React, { useState } from 'react';
import SearchBar from '../search/SearchBar';
import SearchResults from '../search/SearchResults';
import VirtualKeyboard from '../keyboard/VirtualKeyboard';
import PlayerPreview from '../player/PlayerPreview';
import PlaybackControls from '../player/PlaybackControls';
import QueuePanel from '../queue/QueuePanel';
import HistoryPanel from '../history/HistoryPanel';
import { ListMusic, History, Smartphone, Keyboard } from 'lucide-react';

export default function KioskLayout({
  // Search state
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  karaokeMode,
  onToggleKaraoke,
  searchResults,
  searchLoading,
  isRecommendation,
  onSelectCategory,
  activeCategory,
  onEnqueue,
  // Playback state
  playback,
  position,
  onTogglePause,
  onSkip,
  onRestart,
  onVolumeChange,
  onTransposeChange,
  // Queue state
  queue,
  downloading,
  onRemoveQueueSong,
  onPrioritizeQueueSong,
  onReorderQueueSong,
  // View Switcher
  onSwitchToMobile,
}) {
  const [activeRightTab, setActiveRightTab] = useState('keyboard'); // 'keyboard' | 'queue' | 'history'

  const handleSearchFocus = () => {
    setActiveRightTab('keyboard');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ktv-bg p-2 sm:p-3 md:p-4 gap-3 md:gap-4 select-none">
      {/* LEFT COLUMN (60-65%): Search and 100% Full-Height Results Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header: Brand & Search Bar */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-2 pr-2 lg:border-r border-ktv-border shrink-0">
            <img
              src="/logo"
              alt="PiKaraoke"
              className="h-8 md:h-10 max-w-[140px] md:max-w-[170px] object-contain drop-shadow-md"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/static/images/logo.png';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
              karaokeMode={karaokeMode}
              onToggleKaraoke={onToggleKaraoke}
              onFocus={handleSearchFocus}
              readOnly
            />
          </div>

          {/* Quick Switch to Mobile Layout Preview */}
          <button
            type="button"
            onClick={onSwitchToMobile}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ktv-card hover:bg-ktv-surface border border-ktv-border text-slate-300 hover:text-white text-xs font-bold transition-all touch-press shrink-0"
            title="Chuyển sang giao diện mô phỏng điện thoại di động"
          >
            <Smartphone className="w-4 h-4 text-ktv-cyan" />
            <span>Xem Mobile</span>
          </button>
        </div>

        {/* Results Grid Area (Takes 100% available height now that keyboard is in the right column) */}
        <div className="flex-1 overflow-hidden min-h-0">
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            isRecommendation={isRecommendation}
            onSelectCategory={onSelectCategory}
            activeCategory={activeCategory}
            onEnqueue={onEnqueue}
            queue={queue}
            downloading={downloading}
          />
        </div>
      </div>

      {/* RIGHT COLUMN (35-40%): Video Preview, Playback Controls, and 3-Tab Bottom Container */}
      <div className="w-[380px] md:w-[440px] lg:w-[480px] flex flex-col h-full gap-3 overflow-hidden shrink-0">
        {/* Realtime Video Preview (with 60s idle screensaver) */}
        <div className="shrink-0">
          <PlayerPreview
            nowPlaying={playback.now_playing}
            user={playback.now_playing_user}
            isPaused={playback.is_paused}
            screensaverTimeout={60}
            hasUpcoming={queue.length > 0 || downloading.length > 0}
          />
        </div>

        {/* Playback Controls */}
        <div className="shrink-0">
          <PlaybackControls
            playback={playback}
            position={position}
            onTogglePause={onTogglePause}
            onSkip={onSkip}
            onRestart={onRestart}
            onVolumeChange={onVolumeChange}
            onTransposeChange={onTransposeChange}
          />
        </div>

        {/* Bàn phím | Hàng đợi | Lịch sử: một card chung, nút tab nằm cuối */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-ktv-card/90 border border-ktv-border rounded-2xl">
          <div className="flex-1 overflow-hidden min-h-0">
            {activeRightTab === 'keyboard' ? (
              <VirtualKeyboard
                text={searchQuery}
                onChange={onSearchChange}
                onEnter={() => onSearchSubmit(searchQuery)}
              />
            ) : activeRightTab === 'queue' ? (
              <QueuePanel
                queue={queue}
                downloading={downloading}
                onRemove={onRemoveQueueSong}
                onPrioritize={onPrioritizeQueueSong}
                onReorder={onReorderQueueSong}
              />
            ) : (
              <HistoryPanel onEnqueue={onEnqueue} />
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 border-t border-ktv-border/50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveRightTab('keyboard')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all touch-press ${
                activeRightTab === 'keyboard'
                  ? 'bg-gradient-to-r from-ktv-purple to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Bàn phím</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('queue')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all touch-press ${
                activeRightTab === 'queue'
                  ? 'bg-ktv-purple text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Hàng đợi ({queue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('history')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all touch-press ${
                activeRightTab === 'history'
                  ? 'bg-ktv-amber text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
