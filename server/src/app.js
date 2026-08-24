import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem nao permitida pela politica de CORS'));
      }
    },
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
