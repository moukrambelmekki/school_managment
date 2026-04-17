require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authMiddleware = require('./middleware/auth');
const authorizeRole = require('./middleware/authorizeRole');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const initAdmin = require('./utils/initAdmin');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/users', authMiddleware, authorizeRole('Admin'), userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

const startServer = async () => {
  try {
    await connectDB();
    await initAdmin();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
