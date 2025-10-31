const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'al-shaer-family-secret-key-2024';

// Initialize admin user
const initializeAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@alshaerfamily.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AlShaer2024!', 10),
        role: 'admin',
        lastLogin: null
      });
      
      await defaultAdmin.save();
      console.log('✓ تم إنشاء حساب المدير الافتراضي');
      console.log(`  اسم المستخدم: ${defaultAdmin.username}`);
      console.log('  كلمة المرور: AlShaer2024!');
      console.log('  يرجى تغيير كلمة المرور بعد أول تسجيل دخول');
    }
  } catch (error) {
    console.error('خطأ في إنشاء حساب المدير:', error);
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'رمز الوصول مطلوب' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if admin still exists
    const admin = await Admin.findOne({ username: decoded.username });
    if (!admin) {
      return res.status(403).json({ message: 'رمز الوصول غير صالح' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'رمز الوصول غير صالح' });
  }
};

// Admin role check
const requireAdmin = (req, res, next) => {
  const allowedRoles = ['admin', 'super-admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'صلاحيات المدير مطلوبة' });
  }
  next();
};

// Login function
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, hasPassword: !!password });

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const admin = await Admin.findOne({ username });
    console.log('Admin found:', !!admin);
    
    if (!admin) {
      console.log('Admin not found for username:', username);
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) {
      console.log('Invalid password for username:', username);
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { 
        username: admin.username, 
        email: admin.email, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الدخول' });
  }
};

// Change password function
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const admin = await Admin.findOne({ username: req.user.username });
    
    const validPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.updatedAt = new Date();
    await admin.save();

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'خطأ في تغيير كلمة المرور' });
  }
};

module.exports = {
  initializeAdmin,
  authenticateToken,
  requireAdmin,
  login,
  changePassword,
  JWT_SECRET
};
