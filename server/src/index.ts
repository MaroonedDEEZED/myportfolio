import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { cv } from './data/cv.js';
import { PortfolioModel } from './models/Portfolio.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'fallback' });
});

app.get('/api/cv', async (_req, res) => {
  if (mongoose.connection.readyState === 1) {
    const stored = await PortfolioModel.findOne({ slug: 'marouane-bouakba' }).lean() as { payload?: unknown } | null;
    if (stored?.payload) {
      res.json(stored.payload);
      return;
    }
  }
  res.json(cv);
});

const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB unavailable; serving CV fallback data.', error.message));
}

app.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});
