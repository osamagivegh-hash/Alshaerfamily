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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

// Configure CORS properly for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://alshaerfamily.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: process.env.MONGODB_URI ? 'Configured' : 'Not Configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check admin user (remove in production)
app.get('/api/debug/admin', async (req, res) => {
  try {
    const { Admin } = require('./models');
    const adminCount = await Admin.countDocuments();
    const adminUser = await Admin.findOne({ username: 'admin' }, { password: 0 });
    
    res.json({
      adminExists: !!adminUser,
      adminCount,
      adminUser: adminUser ? {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        lastLogin: adminUser.lastLogin
      } : null,
      defaultCredentials: {
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordSet: !!(process.env.ADMIN_PASSWORD || 'AlShaer2024!')
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual admin creation endpoint (remove in production)
app.post('/api/debug/create-admin', async (req, res) => {
  try {
    const { Admin } = require('./models');
    const bcrypt = require('bcryptjs');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      return res.json({ message: 'Admin already exists', adminExists: true });
    }
    
    // Create new admin
    const defaultAdmin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@alshaerfamily.com',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AlShaer2024!', 10),
      role: 'admin',
      lastLogin: null
    });
    
    await defaultAdmin.save();
    
    res.json({ 
      message: 'Admin created successfully',
      admin: {
        username: defaultAdmin.username,
        email: defaultAdmin.email,
        role: defaultAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset admin password endpoint (remove in production)
app.post('/api/debug/reset-admin-password', async (req, res) => {
  try {
    const { Admin } = require('./models');
    const bcrypt = require('bcryptjs');
    
    const admin = await Admin.findOne({ username: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Reset to default password
    const newPassword = process.env.ADMIN_PASSWORD || 'AlShaer2024!';
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.updatedAt = new Date();
    await admin.save();
    
    res.json({ 
      message: 'Admin password reset successfully',
      newPassword: newPassword,
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
