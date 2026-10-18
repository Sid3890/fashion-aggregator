import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[API] Server listening on port ${config.port} in ${config.env} mode`);
  console.log(`[API] Health endpoints: http://localhost:${config.port}/health and http://localhost:${config.port}/api/v1/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[API] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[API] Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('[API] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[API] Process terminated');
  });
});
