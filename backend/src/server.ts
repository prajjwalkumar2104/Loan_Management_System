import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import loanRoutes from './routes/loanRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Core Middleware
app.use(cors());
// Edge case: Limit payload size to prevent DOS attacks via massive JSON payloads
app.use(express.json({ limit: '10mb' })); 

// Temporary health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date() });
});

// TODO: Import and mount your actual routes here in Phase 2
// app.use('/api/auth', authRoutes);
// app.use('/api/loans', loanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error]: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});


export default app;