import { useEffect, useRef, useState } from 'react';
import { ListMusic, Trash2, ArrowUpToLine, User } from 'lucide-react';

const SWIPE_DELETE_THRESHOLD = 80;
const AXIS_LOCK_DISTANCE = 8;

export default function QueuePanel({ queue, downloading, onRemove, onPrioritize, onReorder }) {
  // Single gesture state per row: first dominant axis decides
  // vertical = reorder drag, horizontal = swipe-to-delete
  const [gesture, setGesture] = useState(null); // { pointerId, startX, startY, file, fromIndex, mode, dx, dy, toIndex }
  const rowHeightRef = useRef(0);

  // Any external queue update cancels a gesture in progress
  useEffect(() => {
    setGesture(null);
  }, [queue]);

  const totalCount = (downloading?.length || 0) + (queue?.length || 0);

  const clampIndex = (value, len) => Math.max(0, Math.min(len - 1, value));

  const startGesture = (e, file, fromIndex) => {
    if (e.target.closest('button')) return;
    rowHeightRef.current = e.currentTarget.offsetHeight || 64;
    e.currentTarget.setPointerCapture(e.pointerId);
    setGesture({
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      file,
      fromIndex,
      mode: null,
      dx: 0,
      dy: 0,
      toIndex: fromIndex,
    });
  };

  const moveGesture = (e) => {
    if (!gesture || e.pointerId !== gesture.pointerId) return;
    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;
    if (!gesture.mode) {
      if (Math.abs(dx) < AXIS_LOCK_DISTANCE && Math.abs(dy) < AXIS_LOCK_DISTANCE) return;
      setGesture((g) => ({ ...g, mode: Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'reorder' }));
      return;
    }
    if (gesture.mode === 'swipe') {
      setGesture((g) => ({ ...g, dx: Math.max(0, Math.min(dx, 140)) }));
    } else {
      const toIndex = clampIndex(
        queue.length,
        gesture.fromIndex + Math.round(dy / rowHeightRef.current)
      );
      setGesture((g) => ({ ...g, dy, toIndex }));
    }
  };

  const endGesture = () => {
    if (!gesture) return;
    const { mode, file, fromIndex, toIndex, dx } = gesture;
    setGesture(null);
    if (mode === 'swipe' && dx >= SWIPE_DELETE_THRESHOLD) {
      onRemove(file);
    } else if (mode === 'reorder' && onReorder && toIndex !== fromIndex) {
      onReorder(fromIndex, toIndex);
    }
  };

  const insertAt =
    gesture && gesture.mode === 'reorder' && gesture.toIndex !== gesture.fromIndex
      ? gesture.toIndex > gesture.fromIndex
        ? gesture.toIndex + 1
        : gesture.toIndex
      : -1;

  return (
    <div className="flex flex-col h-full overflow-hidden p-2.5 sm:p-3">
      {/* Queue List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center px-4">
            <ListMusic className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">Hàng đợi đang trống</p>
            <p className="text-xs text-slate-500 mt-1">
              Hãy tìm kiếm và chọn bài để bắt đầu buổi hát karaoke!
            </p>
          </div>
        ) : (
          <>
            {queue.map((item, idx) => {
              // item is either string (song title/path) or object depending on pikaraoke version
              const title = typeof item === 'string' ? item : item.title || item.song;
              const user = typeof item === 'object' ? item.user || item.added_by : null;
              // Backend queue edits match on the file path, not the display title
              const file = typeof item === 'object' ? item.file || title : title;
              const isNext = idx === 0;
              const isGestureRow = gesture && gesture.file === file;
              const isDragging = isGestureRow && gesture.mode === 'reorder';
              const isSwiping = isGestureRow && gesture.mode === 'swipe';
              const swipeDx = isSwiping ? gesture.dx : 0;
              const transform = isDragging
                ? `translateY(${gesture.dy}px)`
                : swipeDx > 0
                ? `translateX(${swipeDx}px)`
                : undefined;

              return (
                <div key={file} className="relative rounded-xl">
                  {insertAt === idx && (
                    <div className="h-1 my-0.5 mx-1 rounded-full bg-ktv-cyan/80" />
                  )}

                  {/* Swipe-to-delete backing layer */}
                  <div
                    className={`absolute inset-0 rounded-xl bg-rose-600 flex items-center justify-end pr-4 transition-opacity duration-150 ${
                      swipeDx > 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <span className="text-white font-bold text-sm">Xóa</span>
                    <Trash2 className="w-5 h-5 text-white ml-1.5" />
                  </div>

                  {/* Row content */}
                  <div
                    className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                      isDragging
                        ? 'bg-ktv-surface border-ktv-cyan/60 shadow-2xl z-20'
                        : isNext
                        ? 'bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border-emerald-500/50 shadow-sm'
                        : 'bg-ktv-surface/60 hover:bg-ktv-surface border-ktv-border/40'
                    }`}
                    style={{ transform, touchAction: 'none' }}
                    onPointerDown={(e) => startGesture(e, file, idx)}
                    onPointerMove={moveGesture}
                    onPointerUp={endGesture}
                    onPointerCancel={endGesture}
                  >
                    {/* Index badge */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isNext
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-ktv-card text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isNext && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                            Hát tiếp theo
                          </span>
                        )}
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                          {title}
                        </h4>
                      </div>

                      {user && (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{user}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isNext && (
                        <button
                          type="button"
                          onClick={() => onPrioritize(file)}
                          className="p-1.5 rounded-lg bg-ktv-card hover:bg-amber-600 text-slate-400 hover:text-white transition-colors touch-press"
                          title="Ưu tiên lên đầu"
                        >
                          <ArrowUpToLine className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemove(file)}
                        className="p-1.5 rounded-lg bg-ktv-card hover:bg-rose-600 text-slate-400 hover:text-white transition-colors touch-press"
                        title="Xóa khỏi hàng đợi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {insertAt === queue.length && (
              <div className="h-1 my-0.5 mx-1 rounded-full bg-ktv-cyan/80" />
            )}

            {/* In-Flight Downloading Songs: appended to the queue end on
                completion, so show them in that position with their numbers */}
            {downloading &&
              downloading.map((item, i) => (
                <div
                  key={`download-${item.video_id || i}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 animate-pulse"
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-indigo-600/50 text-indigo-100">
                    {queue.length + i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-indigo-200 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-indigo-400/80">
                      Đang tải về máy... • {item.user}
                    </p>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}