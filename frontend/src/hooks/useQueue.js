import { useState, useEffect, useCallback } from 'react';
import { pikaraokeApi } from '../api/pikaraoke';
import { getSocket } from '../api/socket';

export function useQueue() {
  const [queue, setQueue] = useState([]);
  const [downloading, setDownloading] = useState([]); // List of songs currently downloading

  const refreshQueue = useCallback(async () => {
    try {
      const data = await pikaraokeApi.getQueue();
      if (Array.isArray(data)) {
        setQueue(data);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  }, []);

  useEffect(() => {
    refreshQueue();

    const socket = getSocket();

    const handleQueueUpdate = () => {
      refreshQueue();
    };

    const handleSongDownloaded = (data) => {
      // Remove from downloading list
      if (data && data.youtube_id) {
        setDownloading((prev) => prev.filter((d) => d.video_id !== data.youtube_id));
      }
      refreshQueue();
    };

    // pop_next() intentionally emits no queue_update; the queue only catches up
    // with playback through now_playing events.
    const handleNowPlaying = () => {
      refreshQueue();
    };

    socket.on('queue_update', handleQueueUpdate);
    socket.on('song_downloaded', handleSongDownloaded);
    socket.on('now_playing', handleNowPlaying);

    return () => {
      socket.off('queue_update', handleQueueUpdate);
      socket.off('song_downloaded', handleSongDownloaded);
      socket.off('now_playing', handleNowPlaying);
    };
  }, [refreshQueue]);

  const enqueue = async (songPath, user = 'Kiosk') => {
    try {
      await pikaraokeApi.enqueue(songPath, user);
      refreshQueue();
      return true;
    } catch (err) {
      console.error('Failed to enqueue song:', err);
      return false;
    }
  };

  const downloadAndEnqueue = async (song, user = 'Kiosk') => {
    try {
      // Add to downloading state for instant visual feedback (one entry per video)
      setDownloading((prev) =>
        prev.some((d) => d.video_id === song.video_id)
          ? prev
          : [
              ...prev,
              {
                video_id: song.video_id,
                title: song.title,
                thumbnail: song.thumbnail,
                user,
              },
            ]
      );

      await pikaraokeApi.downloadAndEnqueue(song.url, song.title, user, true);
      return true;
    } catch (err) {
      console.error('Failed to download & enqueue song:', err);
      setDownloading((prev) => prev.filter((d) => d.video_id !== song.video_id));
      return false;
    }
  };

  const removeSong = async (songPath) => {
    try {
      await pikaraokeApi.editQueue('delete', songPath);
      refreshQueue();
    } catch (err) {
      console.error('Failed to remove song:', err);
    }
  };

  const prioritizeSong = async (songPath) => {
    try {
      await pikaraokeApi.editQueue('top', songPath);
      refreshQueue();
    } catch (err) {
      console.error('Failed to prioritize song:', err);
    }
  };

  const reorderSong = async (oldIndex, newIndex) => {
    try {
      await pikaraokeApi.reorderQueue(oldIndex, newIndex);
      refreshQueue();
    } catch (err) {
      console.error('Failed to reorder queue:', err);
    }
  };

  const clearQueue = async () => {
    try {
      await pikaraokeApi.editQueue('clear', '');
      refreshQueue();
    } catch (err) {
      console.error('Failed to clear queue:', err);
    }
  };

  return {
    queue,
    downloading,
    enqueue,
    downloadAndEnqueue,
    removeSong,
    prioritizeSong,
    reorderSong,
    clearQueue,
    refreshQueue,
  };
}
