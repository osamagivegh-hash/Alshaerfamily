const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { authenticateToken, requireAdmin, login, changePassword } = require('../middleware/auth');
const { 
  News, 
  Conversations, 
  Articles, 
  Palestine, 
  Gallery, 
  Contacts,
  Comments,
  FamilyTickerNews,
  PalestineTickerNews,
  TickerSettings
} = require('../models');

// Import storage configuration
const { upload, isCloudinaryConfigured, cloudinaryFolder, uploadsDir } = require('../config/storage');

// Import Cloudinary utilities
const cloudinaryUtils = require('../utils/cloudinary');

const router = express.Router();

// Helper function to normalize MongoDB documents (convert _id to id)
const normalizeDocument = (doc) => {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map(item => normalizeDocument(item));
  }
  const normalized = doc.toObject ? doc.toObject() : { ...doc };
  if (normalized._id) {
    normalized.id = normalized._id.toString();
  }
  return normalized;
};

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

// Generic CRUD operations for MongoDB collections
const createCRUDRoutes = (sectionName, Model) => {
  // GET all items
  router.get(`/${sectionName}`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = await Model.find().sort({ createdAt: -1 });
      res.json(normalizeDocument(data));
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
        res.json(normalizeDocument(item));
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
        item: normalizeDocument(savedItem) 
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
          item: normalizeDocument(updatedItem) 
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

router.patch('/news/:id/archive', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    if (typeof isArchived !== 'boolean') {
      return res.status(400).json({ message: 'قيمة الأرشفة غير صالحة' });
    }

    const updated = await News.findByIdAndUpdate(
      id,
      { isArchived, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }

    res.json({
      message: isArchived ? 'تم نقل الخبر إلى الأرشيف' : 'تم استرجاع الخبر من الأرشيف',
      item: normalizeDocument(updated)
    });
  } catch (error) {
    console.error('Toggle news archive error:', error);
    res.status(500).json({ message: 'خطأ في تحديث حالة الأرشفة' });
  }
});

// Contact management
router.get('/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contacts = await Contacts.find().sort({ date: -1 });
    res.json(normalizeDocument(contacts));
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
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم اختيار ملف' });
    }

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      try {
        const result = await cloudinaryUtils.uploadImage(req.file.buffer, cloudinaryFolder);
        
        // Validate the response
        if (!result || !result.secure_url) {
          throw new Error('Cloudinary upload returned invalid response');
        }
        
        // Ensure URL is complete and valid
        const imageUrl = result.secure_url;
        if (!imageUrl.startsWith('http')) {
          throw new Error(`Invalid Cloudinary URL format: ${imageUrl}`);
        }
        
        console.log('Image uploaded successfully:', {
          public_id: result.public_id,
          url: imageUrl,
          format: result.format
        });
        
        res.json({ 
          message: 'تم رفع الملف بنجاح إلى Cloudinary', 
          filename: result.public_id,
          url: imageUrl 
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback to local storage
        await saveToLocalStorage(req, res);
      }
    } else {
      // Upload to local storage
      await saveToLocalStorage(req, res);
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'خطأ في رفع الملف' });
  }
});

// Helper function for local storage upload
const saveToLocalStorage = async (req, res) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname);
  const filePath = path.join(uploadsDir, filename);
  
  // Write file to disk
  await fs.writeFile(filePath, req.file.buffer);
  
  const fileUrl = `/uploads/${filename}`;
  res.json({ 
    message: 'تم رفع الملف بنجاح', 
    filename: filename,
    url: fileUrl 
  });
};

// ==================== COMMENTS MANAGEMENT ====================

router.get('/comments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { contentType, contentId } = req.query;
    const query = {};
    if (contentType) query.contentType = contentType;
    if (contentId) query.contentId = contentId;

    const comments = await Comments.find(query).sort({ createdAt: -1 });
    res.json(normalizeDocument(comments));
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'خطأ في جلب التعليقات' });
  }
});

router.delete('/comments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comments.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ message: 'التعليق غير موجود' });
    }

    res.json({ message: 'تم حذف التعليق بنجاح', id });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'خطأ في حذف التعليق' });
  }
});

// ==================== FAMILY TICKER NEWS CRUD ====================

// GET all family ticker news items
router.get('/family-ticker-news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const items = await FamilyTickerNews.find().sort({ order: 1, createdAt: -1 });
    res.json(normalizeDocument(items));
  } catch (error) {
    console.error('Get family ticker news error:', error);
    res.status(500).json({ message: 'خطأ في جلب أخبار الشريط العائلي' });
  }
});

// GET active family ticker news items (for public API)
router.get('/family-ticker-news/active', async (req, res) => {
  try {
    const items = await FamilyTickerNews.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .select('headline');
    
    const headlines = items.map(item => item.headline);
    res.json(headlines);
  } catch (error) {
    console.error('Get active family ticker news error:', error);
    res.status(500).json({ message: 'خطأ في جلب أخبار الشريط العائلي' });
  }
});

// GET single family ticker news item
router.get('/family-ticker-news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await FamilyTickerNews.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'عنصر الشريط غير موجود' });
    }
    
    res.json(normalizeDocument(item));
  } catch (error) {
    console.error('Get family ticker news item error:', error);
    res.status(500).json({ message: 'خطأ في جلب عنصر الشريط' });
  }
});

// POST create new family ticker news item
router.post('/family-ticker-news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { headline, active, order } = req.body;
    
    if (!headline || headline.trim() === '') {
      return res.status(400).json({ message: 'العنوان مطلوب' });
    }
    
    const newItem = new FamilyTickerNews({
      headline: headline.trim(),
      active: active !== undefined ? active : true,
      order: order || 0
    });
    
    const savedItem = await newItem.save();
    res.status(201).json(normalizeDocument(savedItem));
  } catch (error) {
    console.error('Create family ticker news error:', error);
    res.status(500).json({ message: 'خطأ في إضافة عنصر الشريط' });
  }
});

// PUT update family ticker news item
router.put('/family-ticker-news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { headline, active, order } = req.body;
    
    const item = await FamilyTickerNews.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'عنصر الشريط غير موجود' });
    }
    
    if (headline !== undefined) item.headline = headline.trim();
    if (active !== undefined) item.active = active;
    if (order !== undefined) item.order = order;
    item.updatedAt = new Date();
    
    const updatedItem = await item.save();
    res.json(normalizeDocument(updatedItem));
  } catch (error) {
    console.error('Update family ticker news error:', error);
    res.status(500).json({ message: 'خطأ في تحديث عنصر الشريط' });
  }
});

// DELETE family ticker news item
router.delete('/family-ticker-news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await FamilyTickerNews.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ message: 'عنصر الشريط غير موجود' });
    }
    
    res.json({ message: 'تم حذف عنصر الشريط بنجاح' });
  } catch (error) {
    console.error('Delete family ticker news error:', error);
    res.status(500).json({ message: 'خطأ في حذف عنصر الشريط' });
  }
});

// ==================== PALESTINE TICKER NEWS CRUD ====================

// GET all Palestine ticker news items
router.get('/palestine-ticker-news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const items = await PalestineTickerNews.find().sort({ order: 1, createdAt: -1 });
    res.json(normalizeDocument(items));
  } catch (error) {
    console.error('Get Palestine ticker news error:', error);
    res.status(500).json({ message: 'خطأ في جلب أخبار شريط فلسطين' });
  }
});

// GET active Palestine ticker news items (for public API)
router.get('/palestine-ticker-news/active', async (req, res) => {
  try {
    const items = await PalestineTickerNews.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .select('headline');

    const headlines = items.map(item => item.headline);
    res.json(headlines);
  } catch (error) {
    console.error('Get active Palestine ticker news error:', error);
    res.status(500).json({ message: 'خطأ في جلب أخبار شريط فلسطين' });
  }
});

// GET single Palestine ticker news item
router.get('/palestine-ticker-news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PalestineTickerNews.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'عنصر الشريط غير موجود' });
    }

    res.json(normalizeDocument(item));
  } catch (error) {
    console.error('Get Palestine ticker news item error:', error);
    res.status(500).json({ message: 'خطأ في جلب عنصر الشريط' });
  }
});

// POST create new Palestine ticker news item
router.post('/palestine-ticker-news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { headline, source, url, active, order } = req.body;

    const normalizedHeadline = (headline || '').toString().trim();
    if (!normalizedHeadline) {
      return res.status(400).json({ message: 'العنوان مطلوب' });
    }

    const newItem = new PalestineTickerNews({
      headline: normalizedHeadline,
      source: (source || '').toString().trim(),
      url: (url || '').toString().trim(),
      active: active !== undefined ? active : true,
      order: order || 0
    });

    const savedItem = await newItem.save();
    res.status(201).json(normalizeDocument(savedItem));
  } catch (error) {
    console.error('Create Palestine ticker news error:', error);
    res.status(500).json({ message: 'خطأ في إضافة عنصر الشريط' });
  }
});

// PUT update Palestine ticker news item
router.put('/palestine-ticker-news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { headline, source, url, active, order } = req.body;

    const item = await PalestineTickerNews.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'عنصر الشريط غير موجود' });
    }

    if (headline !== undefined) {
      const normalizedHeadline = (headline || '').toString().trim();
      if (!normalizedHeadline) {
        return res.status(400).json({ message: 'العنوان مطلوب' });
      }
      item.headline = normalizedHeadline;
    }
    if (source !== undefined) item.source = (source || '').toString().trim();
    if (url !== undefined) item.url = (url || '').toString().trim();
    if (active !== undefined) item.active = active;
    if (order !== undefined) item.order = order;
    item.updatedAt = new Date();

    const updatedItem = await item.save();
    res.json(normalizeDocument(updatedItem));
  } catch (error) {
    console.error('Update Palestine ticker news error:', error);
    res.status(500).json({ message: 'خطأ في تحديث عنصر الشريط' });
  }
});

// DELETE Palestine ticker news item
router.delete('/palestine-ticker-news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PalestineTickerNews.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: 'عنصر الشريط غير موجود' });
    }

    res.json({ message: 'تم حذف عنصر الشريط بنجاح' });
  } catch (error) {
    console.error('Delete Palestine ticker news error:', error);
    res.status(500).json({ message: 'خطأ في حذف عنصر الشريط' });
  }
});

// ==================== TICKER SETTINGS ====================

// GET ticker settings
router.get('/ticker-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await TickerSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new TickerSettings();
      await settings.save();
    }
    
    res.json(normalizeDocument(settings));
  } catch (error) {
    console.error('Get ticker settings error:', error);
    res.status(500).json({ message: 'خطأ في جلب إعدادات الشريط' });
  }
});

// PUT update ticker settings
router.put('/ticker-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { palestineTickerEnabled, autoUpdateInterval, maxHeadlines, newsApiProvider } = req.body;
    
    let settings = await TickerSettings.findOne();
    
    if (!settings) {
      settings = new TickerSettings();
    }
    
    if (palestineTickerEnabled !== undefined) settings.palestineTickerEnabled = palestineTickerEnabled;
    if (autoUpdateInterval !== undefined) settings.autoUpdateInterval = autoUpdateInterval;
    if (maxHeadlines !== undefined) settings.maxHeadlines = maxHeadlines;
    if (newsApiProvider !== undefined) settings.newsApiProvider = newsApiProvider;
    settings.updatedAt = new Date();
    
    const updatedSettings = await settings.save();
    res.json(normalizeDocument(updatedSettings));
  } catch (error) {
    console.error('Update ticker settings error:', error);
    res.status(500).json({ message: 'خطأ في تحديث إعدادات الشريط' });
  }
});

module.exports = router;
