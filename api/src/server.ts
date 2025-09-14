import express from 'express';
import path from 'path';
import apiTasks from './routes/apiTasks';
import authRoutes from './routes/auth';
import { uploadsPathExport } from './utils/storage';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/auth';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, apiTasks);

app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
