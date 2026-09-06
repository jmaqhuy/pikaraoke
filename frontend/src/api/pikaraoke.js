import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pikaraokeApi = {
  // Playback state
  getNowPlaying: async () => {
    const res = await api.get('/now_playing');
    return res.data;
  },

  // Playback controls
  pause: async () => {
    const res = await api.post('/pause');
    return res.data;
  },

  skip: async () => {
    const res = await api.post('/skip');
    return res.data;
  },

  restart: async () => {
    const res = await api.post('/restart');
    return res.data;
  },

  setVolume: async (vol) => {
    // vol is 0.0 to 1.0
    const res = await api.post(`/volume/${vol}`);
    return res.data;
  },

  setTranspose: async (semitones) => {
    const res = await api.post(`/transpose/${semitones}`);
    return res.data;
  },

  // Queue
  getQueue: async () => {
    const res = await api.get('/get_queue');
    return res.data;
  },

  enqueue: async (songPath, addedBy = 'Kiosk') => {
    const formData = new FormData();
    formData.append('song_to_add', songPath);
    formData.append('song_added_by', addedBy);
    const res = await axios.post('/enqueue', formData);
    return res.data;
  },

  downloadAndEnqueue: async (songUrl, title, addedBy = 'Kiosk', queue = true) => {
    const res = await api.post('/download', {
      song_url: songUrl,
      song_title: title,
      song_added_by: addedBy,
      queue: queue,
    });
    return res.data;
  },

  reorderQueue: async (oldIndex, newIndex) => {
    const formData = new FormData();
    formData.append('old_index', oldIndex);
    formData.append('new_index', newIndex);
    const res = await axios.post('/queue/reorder', formData);
    return res.data;
  },

  editQueue: async (action, song) => {
    // action: 'top', 'bottom', 'up', 'down', 'delete', 'clear'
    const res = await api.post(`/queue/edit?action=${action}&song=${encodeURIComponent(song || '')}`);
    return res.data;
  },

  // Kiosk Search & Songs API
  searchYouTube: async (query, nonKaraoke = false, count = 10) => {
    if (!query) return [];
    const res = await api.get('/api/kiosk/search', {
      params: {
        q: query,
        non_karaoke: nonKaraoke,
        count,
      },
    });
    return res.data;
  },

  getAutocomplete: async (query, signal) => {
    if (!query || query.length < 2) return [];
    const res = await api.get('/api/kiosk/autocomplete', {
      params: { q: query },
      signal: signal,
    });
    return res.data;
  },

  getLocalSongs: async ({ q = '', letter = '', page = 1, perPage = 24, sort = 'alpha' } = {}) => {
    const res = await api.get('/api/kiosk/songs', {
      params: { q, letter, page, per_page: perPage, sort },
    });
    return res.data;
  },

  // Play history
  getHistory: async (limit = 30, offset = 0) => {
    const res = await api.get('/api/history/plays', {
      params: { limit, offset, sort: 'date' },
    });
    return res.data;
  },
};
