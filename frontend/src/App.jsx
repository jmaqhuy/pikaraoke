import { useState, useEffect, useCallback, useMemo } from 'react';
import KioskLayout from './components/kiosk/KioskLayout';
import MobileLayout from './components/mobile/MobileLayout';
import { usePlayback } from './hooks/usePlayback';
import { useQueue } from './hooks/useQueue';
import { pikaraokeApi } from './api/pikaraoke';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORY_QUERIES = {
  hot: 'karaoke việt nam hot',
  nhac_tre: 'karaoke nhạc trẻ thịnh hành',
  bolero: 'karaoke bolero trữ tình',
  remix: 'karaoke remix hot',
};

const SEARCH_PAGE_SIZE = 20;

export default function App() {
  // Screen width responsive check
  const [isMobileScreen, setIsMobileScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [manualView, setManualView] = useState(null); // 'kiosk' | 'mobile' | null (auto)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      // Hysteresis: switching layouts unmounts the preview iframe, so only
      // switch on a clear crossing instead of flapping around the border.
      setIsMobileScreen((prev) => (w < 720 ? true : w > 800 ? false : prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = manualView ? manualView === 'mobile' : isMobileScreen;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [karaokeMode, setKaraokeMode] = useState(() => {
    return localStorage.getItem('ktv_karaoke_mode') !== 'false';
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('hot');

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Playback & Queue Hooks
  const {
    playback,
    position,
    togglePause,
    skip,
    restart,
    setVolume,
    setTranspose,
  } = usePlayback();

  const {
    queue,
    downloading,
    enqueue,
    downloadAndEnqueue,
    removeSong,
    prioritizeSong,
    reorderSong,
    clearQueue,
  } = useQueue();

  // Load initial YouTube recommendations so the list is never empty
  const fetchRecommendations = useCallback(async (cat = 'hot') => {
    setSearchLoading(true);
    try {
      const q = CATEGORY_QUERIES[cat] || CATEGORY_QUERIES.hot;
      const results = await pikaraokeApi.searchYouTube(q, false, SEARCH_PAGE_SIZE);
      const list = Array.isArray(results) ? results : [];
      if (list.length > 0) {
        setRecommendedSongs(list);
        setSearchResults(list);
      }
    } catch (e) {
      console.warn('Could not fetch recommendations:', e);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations('hot');
  }, [fetchRecommendations]);

  // Execute Search
  const executeSearch = useCallback(
    async (query) => {
      const q = (query ?? searchQuery).trim();
      if (!q) {
        setSearchResults(recommendedSongs);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await pikaraokeApi.searchYouTube(q, !karaokeMode, SEARCH_PAGE_SIZE);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('Search error:', err);
        showToast('Lỗi khi tìm kiếm YouTube', 'error');
      } finally {
        setSearchLoading(false);
      }
    },
    [searchQuery, karaokeMode, recommendedSongs]
  );

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults(recommendedSongs);
    }
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setSearchQuery('');
    fetchRecommendations(catId);
  };

  const handleToggleKaraoke = () => {
    setKaraokeMode((prev) => {
      const next = !prev;
      localStorage.setItem('ktv_karaoke_mode', String(next));
      return next;
    });
  };

  const extractVideoId = (text) => {
    if (!text) return null;
    const match = String(text).match(/[A-Za-z0-9_-]{11}/);
    return match ? match[0] : null;
  };

  // Queue contents by video id / file path, so repeat taps are blocked early
  const queuedVideoIds = useMemo(() => {
    const ids = new Set((downloading || []).map((d) => d.video_id).filter(Boolean));
    queue.forEach((item) => {
      let id = null;
      if (typeof item === 'string') {
        id = extractVideoId(item);
      } else if (item) {
        id =
          item.video_id || item.youtube_id || extractVideoId(item.file) || extractVideoId(item.title);
      }
      if (id) ids.add(id);
    });
    return ids;
  }, [queue, downloading]);

  const queuedFilePaths = useMemo(() => {
    const paths = new Set();
    queue.forEach((item) => {
      if (typeof item === 'object' && item && item.file) paths.add(item.file);
      else if (typeof item === 'string') paths.add(item);
    });
    return paths;
  }, [queue]);

  // Enqueue song handler
  const handleEnqueue = async (song) => {
    if (song.video_id && queuedVideoIds.has(song.video_id)) {
      showToast('Bài đã có trong hàng đợi', 'error');
      return;
    }

    if (song.in_library && song.library_path) {
      if (queuedFilePaths.has(song.library_path)) {
        showToast('Bài đã có trong hàng đợi', 'error');
        return;
      }
      const ok = await enqueue(song.library_path);
      if (ok) showToast(`Đã thêm: "${song.title}"`);
      return;
    }

    if (song.path) {
      // Local song
      if (queuedFilePaths.has(song.path)) {
        showToast('Bài đã có trong hàng đợi', 'error');
        return;
      }
      const ok = await enqueue(song.path);
      if (ok) showToast(`Đã thêm: "${song.title}"`);
      return;
    }

    // YouTube download & enqueue
    const ok = await downloadAndEnqueue(song);
    if (ok) showToast(`Đang tải & xếp hàng: "${song.title}"`);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ktv-bg">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-dropdown border border-ktv-border text-white text-xs sm:text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Render Appropriate Layout */}
      {isMobile ? (
        <MobileLayout
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={executeSearch}
          karaokeMode={karaokeMode}
          onToggleKaraoke={handleToggleKaraoke}
          searchResults={searchResults}
          searchLoading={searchLoading}
          isRecommendation={!searchQuery.trim()}
          onSelectCategory={handleSelectCategory}
          activeCategory={activeCategory}
          onEnqueue={handleEnqueue}
          playback={playback}
          position={position}
          onTogglePause={togglePause}
          onSkip={skip}
          onRestart={restart}
          onVolumeChange={setVolume}
          onTransposeChange={setTranspose}
          queue={queue}
          downloading={downloading}
          onRemoveQueueSong={removeSong}
          onPrioritizeQueueSong={prioritizeSong}
          onClearQueue={clearQueue}
          onSwitchToKiosk={() => setManualView('kiosk')}
        />
      ) : (
        <KioskLayout
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={executeSearch}
          karaokeMode={karaokeMode}
          onToggleKaraoke={handleToggleKaraoke}
          searchResults={searchResults}
          searchLoading={searchLoading}
          isRecommendation={!searchQuery.trim()}
          onSelectCategory={handleSelectCategory}
          activeCategory={activeCategory}
          onEnqueue={handleEnqueue}
          playback={playback}
          position={position}
          onTogglePause={togglePause}
          onSkip={skip}
          onRestart={restart}
          onVolumeChange={setVolume}
          onTransposeChange={setTranspose}
          queue={queue}
          downloading={downloading}
          onRemoveQueueSong={removeSong}
          onPrioritizeQueueSong={prioritizeSong}
          onReorderQueueSong={reorderSong}
          onSwitchToMobile={() => setManualView('mobile')}
        />
      )}
    </div>
  );
}
