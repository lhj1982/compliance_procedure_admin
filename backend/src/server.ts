import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import teamsRoutes from './routes/teams';
import proceduresRoutes from './routes/procedures';
import documentsRoutes from './routes/documents';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/procedures', proceduresRoutes);
app.use('/api/documents', documentsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Compliance Admin API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});