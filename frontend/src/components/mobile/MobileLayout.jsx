import React, { useState } from 'react';
import SearchBar from '../search/SearchBar';
import SearchResults from '../search/SearchResults';
import PlayerPreview from '../player/PlayerPreview';
import PlaybackControls from '../player/PlaybackControls';
import QueuePanel from '../queue/QueuePanel';
import HistoryPanel from '../history/HistoryPanel';
import {
  Search,
  ListMusic,
  Sliders,
  History,
  Play,
  Pause,
  SkipForward,
  Monitor,
  Disc,
} from 'lucide-react';

export default function MobileLayout({
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
  onClearQueue,
  // View Switcher
  onSwitchToKiosk,
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'queue' | 'controls' | 'history'

  const isPaused = playback.is_paused ?? true;
  const nowPlaying = playback.now_playing;
  const queueCount = (downloading?.length || 0) + (queue?.length || 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ktv-bg text-slate-100 select-none">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between p-3 bg-ktv-card/90 border-b border-ktv-border shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/logo"
            alt="PiKaraoke"
            className="h-7 max-w-[110px] object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/static/images/logo.png';
            }}
          />
          <span className="text-[9px] font-bold uppercase tracking-wider text-ktv-cyan bg-ktv-surface px-1.5 py-0.5 rounded border border-ktv-border">
            Mobile
          </span>
        </div>

        {/* Switch back to Kiosk Mode */}
        <button
          type="button"
          onClick={onSwitchToKiosk}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-ktv-surface hover:bg-ktv-surface-hover border border-ktv-border touch-press transition-colors"
        >
          <Monitor className="w-3.5 h-3.5 text-ktv-purple" />
          <span>Giao diện Kiosk</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-2.5 sm:p-3 pb-16 flex flex-col min-h-0">
        {/* Tab 1: Search */}
        {activeTab === 'search' && (
          <div className="flex flex-col h-full overflow-hidden gap-2.5">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
              karaokeMode={karaokeMode}
              onToggleKaraoke={onToggleKaraoke}
              placeholder="Nhập tên bài hát hoặc ca sĩ..."
            />
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
        )}

        {/* Tab 2: Queue */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-hidden min-h-0">
            <QueuePanel
              queue={queue}
              downloading={downloading}
              onRemove={onRemoveQueueSong}
              onPrioritize={onPrioritizeQueueSong}
              onClear={onClearQueue}
            />
          </div>
        )}

        {/* Tab 3: Controls */}
        {activeTab === 'controls' && (
          <div className="flex flex-col h-full overflow-y-auto space-y-3">
            <div className="w-full">
              <PlayerPreview
                nowPlaying={playback.now_playing}
                user={playback.now_playing_user}
                isPaused={playback.is_paused}
                screensaverTimeout={180}
              />
            </div>
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
        )}

        {/* Tab 4: History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-hidden min-h-0">
            <HistoryPanel onEnqueue={onEnqueue} />
          </div>
        )}
      </main>

      {/* Persistent Mini Player Bar (shown when not on 'controls' tab and a song is playing) */}
      {activeTab !== 'controls' && nowPlaying && (
        <div className="fixed bottom-14 left-2 right-2 z-40 bg-ktv-card/95 border border-ktv-border rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5">
          <div
            onClick={() => setActiveTab('controls')}
            className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer touch-press"
          >
            <div className="w-8 h-8 rounded-lg bg-ktv-surface flex items-center justify-center shrink-0 border border-ktv-border/60">
              <Disc className={`w-4 h-4 text-ktv-cyan ${!isPaused ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">{nowPlaying}</p>
              <p className="text-[10px] text-slate-400">
                {isPaused ? 'Tạm dừng' : 'Đang phát'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onTogglePause}
              className={`p-2 rounded-xl transition-all touch-press ${
                isPaused
                  ? 'bg-emerald-600 text-white'
                  : 'bg-ktv-surface hover:bg-ktv-surface-hover text-slate-200'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="p-2 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover text-slate-200 transition-all touch-press"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-ktv-card/95 border-t border-ktv-border flex items-center justify-around px-2 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center flex-1 py-1 touch-press ${
            activeTab === 'search' ? 'text-ktv-purple font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tìm bài</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 touch-press ${
            activeTab === 'queue' ? 'text-ktv-purple font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ListMusic className="w-5 h-5 mb-0.5" />
            {queueCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-ktv-rose text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {queueCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Hàng đợi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('controls')}
          className={`flex flex-col items-center justify-center flex-1 py-1 touch-press ${
            activeTab === 'controls' ? 'text-ktv-purple font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Điều khiển</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 touch-press ${
            activeTab === 'history' ? 'text-ktv-purple font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lịch sử</span>
        </button>
      </nav>
    </div>
  );
}
