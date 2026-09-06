import { useState, useEffect } from 'react';
import { History, Plus, User, Loader2 } from 'lucide-react';
import { pikaraokeApi } from '../../api/pikaraoke';

export default function HistoryPanel({ onEnqueue }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await pikaraokeApi.getHistory(30, 0);
      // The API returns either an array or { items: [...] }
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && data.items) {
        setHistory(data.items);
      }
    } catch (err) {
      console.warn('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden p-2.5 sm:p-3">
      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading && history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Loader2 className="w-6 h-6 text-ktv-purple animate-spin mb-2" />
            <p className="text-xs">Đang tải lịch sử...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center px-4">
            <History className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">Chưa có bài hát nào</p>
          </div>
        ) : (
          history.map((item, idx) => {
            const title = item.song || item.title || item.song_title;
            const performer = item.performer || item.user;

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-ktv-surface/60 hover:bg-ktv-surface border border-ktv-border/40 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                    {title}
                  </h4>
                  {performer && (
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{performer}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onEnqueue({ title, path: item.path })}
                  className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-ktv-surface hover:bg-ktv-purple text-slate-200 hover:text-white text-xs font-bold transition-all touch-press shrink-0 shadow-sm"
                  title="Hát lại bài này"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Hát lại</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
