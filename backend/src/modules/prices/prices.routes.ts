import { Router } from 'express';
export const pricesRouter = Router();

pricesRouter.get('/pairs', (req, res) => {
  return res.json({
    pairs: ['BTC/USDT', 'ETH/USDT', 'GOLD', 'NAS100'],
  });
});
