import http from 'http';
import { Server as IOServer } from 'socket.io';
import { app } from './app';
import { env } from './config/env';
import { initPriceFeed } from './modules/prices/prices.ws';

const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: env.CORS_ORIGINS,
  },
});


// init websocket feeds
initPriceFeed(io);

server.listen(env.PORT, () => {
  console.log(`Backend listening on port ${env.PORT}`);
});
