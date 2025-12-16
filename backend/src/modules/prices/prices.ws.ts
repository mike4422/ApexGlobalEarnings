import { Server } from 'socket.io';

type PriceState = {
  [pair: string]: number;
};

export function initPriceFeed(io: Server) {
  const state: PriceState = {
    'BTC/USDT': 65000,
    'ETH/USDT': 3200,
    GOLD: 2400,
    NAS100: 18000,
  };

  setInterval(() => {
    Object.keys(state).forEach((pair) => {
      const base = state[pair];
      const delta = base * (Math.random() - 0.5) * 0.001; // +/-0.1%
      state[pair] = Math.max(1, base + delta);
    });

    io.emit('price:update', state);
  }, 2000);
}
