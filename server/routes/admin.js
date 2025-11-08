const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { authenticateToken, requireAdmin, login, changePassword } = require('../middleware/auth');
const { 
  News, 
  Conversations, 
  Articles, 
  Palestine, 
  Gallery, 
  Contacts 
} = require('../models');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط الصور مسموحة'), false);
    }
  }
});

// Auth routes
router.post('/login', login);
router.post('/change-password', authenticateToken, requireAdmin, changePassword);

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// Dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = {};
    
    // Count items in each section using MongoDB
    stats.news = await News.countDocuments();
    stats.conversations = await Conversations.countDocuments();
    stats.articles = await Articles.countDocuments();
    stats.palestine = await Palestine.countDocuments();
    stats.gallery = await Gallery.countDocuments();
    
    // Count contacts
    stats.contacts = await Contacts.countDocuments();
    stats.unreadContacts = await Contacts.countDocuments({ status: 'new' });

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'خطأ في جلب الإحصائيات' });
  }
});

// Generic CRUD operations for sections
const createCRUDRoutes = (sectionName) => {
  // GET all items
  router.get(`/${sectionName}`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const filePath = path.join(dataDir, `${sectionName}.json`);
      if (await fs.pathExists(filePath)) {
        const data = await fs.readJson(filePath);
        res.json(data);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: `خطأ في جلب ${sectionName}` });
    }
  });

  // GET single item
  router.get(`/${sectionName}/:id`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(dataDir, `${sectionName}.json`);
      
      if (await fs.pathExists(filePath)) {
        const data = await fs.readJson(filePath);
        const item = Array.isArray(data) ? data.find(item => item.id == id) : data;
        
        if (item) {
          res.json(item);
        } else {
          res.status(404).json({ message: 'العنصر غير موجود' });
        }
      } else {
        res.status(404).json({ message: 'العنصر غير موجود' });
      }
    } catch (error) {
      res.status(500).json({ message: `خطأ في جلب ${sectionName}` });
    }
  });

  // POST create item
  router.post(`/${sectionName}`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const filePath = path.join(dataDir, `${sectionName}.json`);
      let data = [];
      
      if (await fs.pathExists(filePath)) {
        data = await fs.readJson(filePath);
        if (!Array.isArray(data)) {
          data = [];
        }
      }

      const newItem = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.push(newItem);
      await fs.writeJson(filePath, data);
      
      res.status(201).json({ message: 'تم إضافة العنصر بنجاح', item: newItem });
    } catch (error) {
      console.error(`Create ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في إضافة ${sectionName}` });
    }
  });

  // PUT update item
  router.put(`/${sectionName}/:id`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(dataDir, `${sectionName}.json`);
      
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({ message: 'العنصر غير موجود' });
      }

      const data = await fs.readJson(filePath);
      const itemIndex = data.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'العنصر غير موجود' });
      }

      data[itemIndex] = {
        ...data[itemIndex],
        ...req.body,
        id: id, // Keep original ID
        updatedAt: new Date().toISOString()
      };

      await fs.writeJson(filePath, data);
      res.json({ message: 'تم تحديث العنصر بنجاح', item: data[itemIndex] });
    } catch (error) {
      console.error(`Update ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في تحديث ${sectionName}` });
    }
  });

  // DELETE item
  router.delete(`/${sectionName}/:id`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(dataDir, `${sectionName}.json`);
      
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({ message: 'العنصر غير موجود' });
      }

      const data = await fs.readJson(filePath);
      const itemIndex = data.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'العنصر غير موجود' });
      }

      const deletedItem = data.splice(itemIndex, 1)[0];
      await fs.writeJson(filePath, data);
      
      res.json({ message: 'تم حذف العنصر بنجاح', item: deletedItem });
    } catch (error) {
      console.error(`Delete ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في حذف ${sectionName}` });
    }
  });
};

// Create CRUD routes for all sections
['news', 'conversations', 'articles', 'palestine', 'gallery'].forEach(section => {
  createCRUDRoutes(section);
});

// Contact management
router.get('/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contactsFile = path.join(dataDir, 'contacts.json');
    if (await fs.pathExists(contactsFile)) {
      const contacts = await fs.readJson(contactsFile);
      res.json(contacts.reverse()); // Show newest first
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الرسائل' });
  }
});

router.put('/contacts/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const contactsFile = path.join(dataDir, 'contacts.json');
    if (!await fs.pathExists(contactsFile)) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    const contacts = await fs.readJson(contactsFile);
    const contactIndex = contacts.findIndex(contact => contact.id == id);
    
    if (contactIndex === -1) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    contacts[contactIndex].status = status;
    contacts[contactIndex].updatedAt = new Date().toISOString();
    
    await fs.writeJson(contactsFile, contacts);
    res.json({ message: 'تم تحديث حالة الرسالة بنجاح' });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'خطأ في تحديث حالة الرسالة' });
  }
});

router.delete('/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const contactsFile = path.join(dataDir, 'contacts.json');
    if (!await fs.pathExists(contactsFile)) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    const contacts = await fs.readJson(contactsFile);
    const contactIndex = contacts.findIndex(contact => contact.id == id);
    
    if (contactIndex === -1) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    const deletedContact = contacts.splice(contactIndex, 1)[0];
    await fs.writeJson(contactsFile, contacts);
    
    res.json({ message: 'تم حذف الرسالة بنجاح', contact: deletedContact });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'خطأ في حذف الرسالة' });
  }
});

// File upload endpoint
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم اختيار ملف' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'تم رفع الملف بنجاح', 
      filename: req.file.filename,
      url: fileUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'خطأ في رفع الملف' });
  }
});

// Bulk operations
router.post('/bulk-delete/:section', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { section } = req.params;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'معرفات العناصر مطلوبة' });
    }

    const filePath = path.join(dataDir, `${section}.json`);
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ message: 'القسم غير موجود' });
    }

    const data = await fs.readJson(filePath);
    const filteredData = data.filter(item => !ids.includes(item.id));
    
    await fs.writeJson(filePath, filteredData);
    res.json({ 
      message: `تم حذف ${ids.length} عنصر بنجاح`,
      deletedCount: data.length - filteredData.length
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'خطأ في الحذف المجمع' });
  }
});

module.exports = router;
