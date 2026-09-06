import { useState, useEffect, useCallback } from 'react';
import { pikaraokeApi } from '../api/pikaraoke';
import { getSocket } from '../api/socket';

export function usePlayback() {
  const [playback, setPlayback] = useState({
    now_playing: null,
    now_playing_user: null,
    now_playing_duration: null,
    now_playing_transpose: 0,
    now_playing_url: null,
    now_playing_position: 0,
    is_paused: true,
    volume: 0.85,
    up_next: null,
    next_user: null,
  });

  const [position, setPosition] = useState(0);

  // Fetch initial state
  const refreshNowPlaying = useCallback(async () => {
    try {
      const data = await pikaraokeApi.getNowPlaying();
      if (data) {
        setPlayback(data);
        if (data.now_playing_position != null) {
          setPosition(data.now_playing_position);
        }
      }
    } catch (err) {
      console.error('Error fetching now_playing:', err);
    }
  }, []);

  useEffect(() => {
    refreshNowPlaying();

    const socket = getSocket();

    const handleNowPlaying = (data) => {
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      setPlayback(prev => ({ ...prev, ...data }));
      if (data && data.now_playing_position != null) {
        setPosition(data.now_playing_position);
      }
    };

    const handlePosition = (pos) => {
      setPosition(pos);
    };

    socket.on('now_playing', handleNowPlaying);
    socket.on('playback_position', handlePosition);

    return () => {
      socket.off('now_playing', handleNowPlaying);
      socket.off('playback_position', handlePosition);
    };
  }, [refreshNowPlaying]);

  const togglePause = async () => {
    try {
      await pikaraokeApi.pause();
    } catch (e) {
      console.error(e);
    }
  };

  const skip = async () => {
    try {
      await pikaraokeApi.skip();
    } catch (e) {
      console.error(e);
    }
  };

  const restart = async () => {
    try {
      await pikaraokeApi.restart();
    } catch (e) {
      console.error(e);
    }
  };

  const setVolume = async (vol) => {
    try {
      setPlayback(prev => ({ ...prev, volume: vol }));
      await pikaraokeApi.setVolume(vol);
    } catch (e) {
      console.error(e);
    }
  };

  const setTranspose = async (semitones) => {
    try {
      setPlayback(prev => ({ ...prev, now_playing_transpose: semitones }));
      await pikaraokeApi.setTranspose(semitones);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    playback,
    position,
    togglePause,
    skip,
    restart,
    setVolume,
    setTranspose,
    refreshNowPlaying,
  };
}
