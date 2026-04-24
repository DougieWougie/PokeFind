import express from 'express';
import rateLimit from 'express-rate-limit';
import productsRouter from './routes/products.js';
import cardsRouter from './routes/cards.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(express.json());

// Rate-limit per forwarded IP (Nginx sets X-Real-IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-real-ip'] as string || req.ip || 'unknown',
});
app.use(limiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/products', productsRouter);
app.use('/api/cards', cardsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`pokefind API listening on :${PORT}`);
});
