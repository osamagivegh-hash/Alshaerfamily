const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./models');
const { initializeAdmin } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().then(() => {
  // Initialize admin user after DB connection
  initializeAdmin();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'تم تجاوز الحد المسموح من الطلبات، حاول مرة أخرى لاحقاً'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', require('./routes/api'));
app.use('/api/admin', require('./routes/adminMongo'));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`خادم عائلة الشاعر يعمل على المنفذ ${PORT}`);
});
