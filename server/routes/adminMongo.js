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
  FamilyTree, 
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
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

    // Count family tree members
    const familyTree = await FamilyTree.findOne();
    if (familyTree && familyTree.generations) {
      stats.familyMembers = familyTree.generations.reduce((total, gen) => 
        total + (gen.members ? gen.members.length : 0), 0);
    } else {
      stats.familyMembers = 0;
    }

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'خطأ في جلب الإحصائيات' });
  }
});

// Generic CRUD operations for MongoDB collections
const createCRUDRoutes = (sectionName, Model) => {
  // GET all items
  router.get(`/${sectionName}`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = await Model.find().sort({ createdAt: -1 });
      res.json(data);
    } catch (error) {
      console.error(`Get ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في جلب ${sectionName}` });
    }
  });

  // GET single item
  router.get(`/${sectionName}/:id`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Model.findById(id);
      
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: 'العنصر غير موجود' });
      }
    } catch (error) {
      console.error(`Get single ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في جلب ${sectionName}` });
    }
  });

  // POST create item
  router.post(`/${sectionName}`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const newItem = new Model(req.body);
      const savedItem = await newItem.save();
      
      res.status(201).json({ 
        message: 'تم إضافة العنصر بنجاح', 
        item: savedItem 
      });
    } catch (error) {
      console.error(`Create ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في إضافة ${sectionName}` });
    }
  });

  // PUT update item
  router.put(`/${sectionName}/:id`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedItem = await Model.findByIdAndUpdate(
        id, 
        { ...req.body, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      );
      
      if (updatedItem) {
        res.json({ 
          message: 'تم تحديث العنصر بنجاح', 
          item: updatedItem 
        });
      } else {
        res.status(404).json({ message: 'العنصر غير موجود' });
      }
    } catch (error) {
      console.error(`Update ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في تحديث ${sectionName}` });
    }
  });

  // DELETE item
  router.delete(`/${sectionName}/:id`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deletedItem = await Model.findByIdAndDelete(id);
      
      if (deletedItem) {
        res.json({ 
          message: 'تم حذف العنصر بنجاح', 
          item: deletedItem 
        });
      } else {
        res.status(404).json({ message: 'العنصر غير موجود' });
      }
    } catch (error) {
      console.error(`Delete ${sectionName} error:`, error);
      res.status(500).json({ message: `خطأ في حذف ${sectionName}` });
    }
  });

  // Bulk delete
  router.post(`/bulk-delete/${sectionName}`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'معرفات العناصر مطلوبة' });
      }

      const result = await Model.deleteMany({ _id: { $in: ids } });
      
      res.json({ 
        message: `تم حذف ${result.deletedCount} عنصر بنجاح`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error(`Bulk delete ${sectionName} error:`, error);
      res.status(500).json({ message: 'خطأ في الحذف المجمع' });
    }
  });
};

// Create CRUD routes for all sections
createCRUDRoutes('news', News);
createCRUDRoutes('conversations', Conversations);
createCRUDRoutes('articles', Articles);
createCRUDRoutes('palestine', Palestine);
createCRUDRoutes('gallery', Gallery);

// Special route for family tree (single document)
router.get('/family-tree', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let familyTree = await FamilyTree.findOne();
    if (!familyTree) {
      familyTree = new FamilyTree({ patriarch: '', generations: [] });
      await familyTree.save();
    }
    res.json(familyTree);
  } catch (error) {
    console.error('Get family tree error:', error);
    res.status(500).json({ message: 'خطأ في جلب شجرة العائلة' });
  }
});

router.put('/family-tree', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let familyTree = await FamilyTree.findOne();
    
    if (familyTree) {
      familyTree.patriarch = req.body.patriarch;
      familyTree.generations = req.body.generations;
      familyTree.updatedAt = new Date();
      await familyTree.save();
    } else {
      familyTree = new FamilyTree({
        ...req.body,
        updatedAt: new Date()
      });
      await familyTree.save();
    }
    
    res.json({ 
      message: 'تم تحديث شجرة العائلة بنجاح', 
      data: familyTree 
    });
  } catch (error) {
    console.error('Update family tree error:', error);
    res.status(500).json({ message: 'خطأ في تحديث شجرة العائلة' });
  }
});

// Contact management
router.get('/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contacts = await Contacts.find().sort({ date: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'خطأ في جلب الرسائل' });
  }
});

router.put('/contacts/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const contact = await Contacts.findByIdAndUpdate(
      id, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
    
    if (contact) {
      res.json({ message: 'تم تحديث حالة الرسالة بنجاح' });
    } else {
      res.status(404).json({ message: 'الرسالة غير موجودة' });
    }
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'خطأ في تحديث حالة الرسالة' });
  }
});

router.delete('/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contacts.findByIdAndDelete(id);
    
    if (deletedContact) {
      res.json({ 
        message: 'تم حذف الرسالة بنجاح', 
        contact: deletedContact 
      });
    } else {
      res.status(404).json({ message: 'الرسالة غير موجودة' });
    }
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

module.exports = router;
