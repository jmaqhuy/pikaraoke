import { MonitorPlay, Loader2, Clock, HardDrive, ListMusic } from 'lucide-react';

export default function SearchResults({
  results,
  loading,
  onEnqueue,
  isRecommendation = false,
  onSelectCategory,
  activeCategory,
  queue = [],
  downloading = [],
}) {
  const categories = [
    { id: 'hot', label: 'Thịnh hành' },
    { id: 'nhac_tre', label: 'Nhạc trẻ' },
    { id: 'bolero', label: 'Bolero' },
    { id: 'remix', label: 'Remix' },
  ];

  const extractVideoId = (text) => {
    if (!text) return null;
    const match = String(text).match(/[A-Za-z0-9_-]{11}/);
    return match ? match[0] : null;
  };

  const queuedIds = new Set();
  queue.forEach((item) => {
    let id = null;
    if (typeof item === 'string') {
      id = extractVideoId(item);
    } else if (item) {
      id =
        item.video_id || item.youtube_id || extractVideoId(item.file) || extractVideoId(item.title);
    }
    if (id) queuedIds.add(id);
  });
  const downloadingIds = new Set((downloading || []).map((d) => d.video_id).filter(Boolean));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Recommendation Category Quick Chips */}
      {isRecommendation && (
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all touch-press shrink-0 border ${
                activeCategory === cat.id
                  ? 'bg-ktv-purple text-white border-ktv-purple shadow-neon-purple'
                  : 'bg-ktv-card/80 text-slate-400 border-ktv-border hover:text-slate-200 hover:bg-ktv-surface'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-400">
            <Loader2 className="w-8 h-8 text-ktv-purple animate-spin mb-3" />
            <p className="text-sm font-medium">Đang tìm bài hát...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-500 text-center px-4">
            <MonitorPlay className="w-12 h-12 stroke-1 mb-2 text-slate-600" />
            <p className="text-base font-semibold text-slate-300 mb-1">Không tìm thấy bài hát</p>
            <p className="text-xs text-slate-500">Thử từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3 pb-4">
            {results.map((song, idx) => {
              const isDownloading = Boolean(song.video_id && downloadingIds.has(song.video_id));
              const isQueued =
                isDownloading || Boolean(song.video_id && queuedIds.has(song.video_id));

              return (
                <button
                  type="button"
                  key={song.video_id || song.path || idx}
                  onClick={() => {
                    if (!isQueued) onEnqueue(song);
                  }}
                  disabled={isQueued}
                  className={`text-left flex flex-col bg-ktv-card/90 border border-ktv-border/70 rounded-2xl p-2.5 sm:p-3 transition-all duration-200 touch-press ${
                    isQueued
                      ? 'opacity-60'
                      : 'hover:bg-ktv-card hover:border-ktv-purple/60 hover:shadow-lg'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-500">
                        <MonitorPlay className="w-8 h-8" />
                      </div>
                    )}

                    {song.duration && (
                      <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {song.duration}
                      </span>
                    )}

                    {isDownloading ? (
                      <span className="absolute top-1.5 left-1.5 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang tải
                      </span>
                    ) : isQueued ? (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                        <ListMusic className="w-3 h-3" />
                        Trong hàng đợi
                      </span>
                    ) : song.in_library ? (
                      <span
                        className="absolute top-1.5 left-1.5 bg-emerald-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center shadow"
                        title="Đã có trong thư viện"
                      >
                        <HardDrive className="w-3 h-3" />
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h4
                    className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug hover:text-ktv-cyan transition-colors"
                    title={song.title}
                  >
                    {song.title}
                  </h4>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}