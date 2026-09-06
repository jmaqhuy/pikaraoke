import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Mic2, Loader2 } from 'lucide-react';
import { pikaraokeApi } from '../../api/pikaraoke';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  karaokeMode,
  onToggleKaraoke,
  placeholder = "Nhập tên bài hát, ca sĩ, hoặc viết tắt (VD: cdns)...",
  onFocus,
  readOnly = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced Autocomplete without spamming
  useEffect(() => {
    const query = value.trim();

    // Reset if query is too short
    if (query.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      setShowDropdown(false);
      return;
    }

    // Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSuggesting(true);
    const timer = setTimeout(async () => {
      try {
        const results = await pikaraokeApi.getAutocomplete(query, controller.signal);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.warn('Autocomplete error:', err);
        }
      } finally {
        setIsSuggesting(false);
      }
    }, 350); // 350ms debounce prevents request spamming

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion);
    setShowDropdown(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full bg-ktv-card/90 hover:bg-ktv-card border border-ktv-border focus-within:border-ktv-purple focus-within:shadow-neon-purple rounded-xl px-2 py-1.5 sm:py-2 transition-all duration-200"
      >
        {/* Karaoke Toggle Chip */}
        <button
          type="button"
          onClick={onToggleKaraoke}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-bold text-xs tracking-wide transition-all touch-press shrink-0 mr-1.5 ${
            karaokeMode
              ? 'bg-gradient-to-r from-rose-500 to-ktv-rose text-white shadow-neon-rose ring-1 ring-rose-300/40'
              : 'bg-ktv-surface text-slate-400 hover:text-slate-200 border border-ktv-border'
          }`}
          title="Bật/Tắt tự động thêm từ khóa Karaoke khi tìm kiếm"
        >
          <Mic2 className={`w-3.5 h-3.5 ${karaokeMode ? 'animate-pulse' : ''}`} />
          <span>Karaoke</span>
          <span
            className={`w-2 h-2 rounded-full ${
              karaokeMode ? 'bg-emerald-300 ring-2 ring-emerald-500/50' : 'bg-slate-600'
            }`}
          />
        </button>

        {/* Search Input */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (onFocus) onFocus();
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholder}
            readOnly={readOnly}
            inputMode={readOnly ? 'none' : undefined}
            autoComplete="off"
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base font-medium outline-none pr-8"
          />

          {isSuggesting && (
            <Loader2 className="w-4 h-4 text-ktv-purple animate-spin absolute right-2" />
          )}

          {!isSuggesting && value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setSuggestions([]);
              }}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-full touch-press absolute right-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          className="ml-1.5 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-r from-ktv-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple touch-press shrink-0"
          title="Tìm kiếm"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-dropdown rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1.5 flex flex-col">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-ktv-surface-hover flex items-center gap-2.5 transition-colors touch-press"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
