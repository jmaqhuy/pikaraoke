import { Delete, Search, Space } from 'lucide-react';
import { applyTelexKey } from '../../utils/telex';

export default function VirtualKeyboard({
  text,
  onChange,
  onEnter,
}) {
  // Telex is always on: Vietnamese users type naturally, plain letters work
  // as-is for English and initials searches (matching strips accents).
  const handleKeyPress = (char) => {
    onChange(applyTelexKey(text, char));
  };

  const handleBackspace = () => {
    if (text.length > 0) {
      onChange(text.slice(0, -1));
    }
  };

  const handleSpace = () => {
    onChange(text + ' ');
  };

  const rowNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  return (
    <div className="flex flex-col h-full justify-between p-2.5 sm:p-3 overflow-hidden select-none">
      {/* Keys Layout: Fitted for Right Column */}
      <div className="flex-1 flex flex-col justify-around py-1.5 gap-1.5">
        {/* Number Row */}
        <div className="flex justify-between gap-1">
          {rowNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="flex-1 h-9 sm:h-10 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover active:bg-ktv-purple text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-ktv-border/60 transition-all touch-press shadow-sm"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Row 1: Q-P */}
        <div className="flex justify-between gap-1">
          {row1.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => handleKeyPress(char.toLowerCase())}
              className="flex-1 h-9 sm:h-10 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover active:bg-ktv-purple text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-ktv-border/60 transition-all touch-press shadow-sm"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 2: A-L */}
        <div className="flex justify-between gap-1 px-1 sm:px-2">
          {row2.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => handleKeyPress(char.toLowerCase())}
              className="flex-1 h-9 sm:h-10 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover active:bg-ktv-purple text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-ktv-border/60 transition-all touch-press shadow-sm"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 3: Z-M + Backspace */}
        <div className="flex justify-between gap-1">
          {row3.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => handleKeyPress(char.toLowerCase())}
              className="flex-1 h-9 sm:h-10 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover active:bg-ktv-purple text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-ktv-border/60 transition-all touch-press shadow-sm"
            >
              {char}
            </button>
          ))}

          <button
            type="button"
            onClick={handleBackspace}
            className="flex-1 max-w-[56px] h-9 sm:h-10 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 active:bg-rose-600 text-rose-300 hover:text-white flex items-center justify-center border border-rose-800/40 transition-all touch-press"
            title="Xóa 1 ký tự"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Row 4: Space + Search */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={handleSpace}
            className="flex-1 h-9 sm:h-10 rounded-xl bg-ktv-surface hover:bg-ktv-surface-hover active:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-ktv-border/60 flex items-center justify-center gap-2 transition-all touch-press"
          >
            <Space className="w-4 h-4" />
            <span>Khoảng cách</span>
          </button>

          <button
            type="button"
            onClick={onEnter}
            className="w-24 sm:w-28 h-9 sm:h-10 rounded-xl bg-gradient-to-r from-ktv-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-indigo-700 active:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-neon-purple flex items-center justify-center gap-1.5 transition-all touch-press shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm bài</span>
          </button>
        </div>
      </div>
    </div>
  );
}