import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to PiKaraoke Socket.IO:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from PiKaraoke Socket.IO:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });
  }

  return socketInstance;
}
