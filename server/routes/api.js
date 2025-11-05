const express = require('express');
const { 
  News, 
  Conversations, 
  Articles, 
  Palestine, 
  Gallery, 
  FamilyTree, 
  Contacts,
  Comments,
  FamilyTickerNews
} = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  validate, 
  contactValidation, 
  commentValidation,
  sanitizeInput 
} = require('../middleware/validation');
const logger = require('../middleware/logger');
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

// Get all sections data
router.get('/sections', asyncHandler(async (req, res) => {
  const sections = {};
  
  // Fetch data from MongoDB collections - removed limit to show all items
  sections.news = normalizeDocument(await News.find().sort({ date: -1 }));
  sections.conversations = normalizeDocument(await Conversations.find().sort({ date: -1 }).limit(10));
  sections.articles = normalizeDocument(await Articles.find().sort({ date: -1 }).limit(10));
  sections.palestine = normalizeDocument(await Palestine.find().sort({ createdAt: -1 }));
  sections.gallery = normalizeDocument(await Gallery.find().sort({ createdAt: -1 }));
  
  // Get family tree
  const familyTree = await FamilyTree.findOne();
  sections.familyTree = normalizeDocument(familyTree) || { patriarch: '', generations: [] };
  
  logger.info('Fetched all sections data');
  res.success(200, 'تم جلب البيانات بنجاح', sections);
}));

// Get specific section data
router.get('/sections/:section', asyncHandler(async (req, res) => {
  const { section } = req.params;
  let data = [];
  
  switch (section) {
    case 'news':
      data = normalizeDocument(await News.find().sort({ date: -1 }));
      break;
    case 'conversations':
      data = normalizeDocument(await Conversations.find().sort({ date: -1 }).limit(10));
      break;
    case 'articles':
      data = normalizeDocument(await Articles.find().sort({ date: -1 }).limit(10));
      break;
    case 'palestine':
      data = normalizeDocument(await Palestine.find().sort({ createdAt: -1 }));
      break;
    case 'gallery':
      data = normalizeDocument(await Gallery.find().sort({ createdAt: -1 }));
      break;
    case 'familyTree':
      const familyTree = await FamilyTree.findOne();
      data = normalizeDocument(familyTree) || { patriarch: '', generations: [] };
      break;
    default:
      return res.error(404, 'القسم غير موجود');
  }
  
  logger.info(`Fetched section: ${section}`);
  res.success(200, 'تم جلب البيانات بنجاح', data);
}));

// Handle contact form submissions
router.post('/contact', sanitizeInput, validate(contactValidation), asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  
  const newContact = new Contacts({
    name,
    email,
    message,
    status: 'new'
  });
  
  await newContact.save();
  
  logger.info('New contact message received', { email, name });
  res.success(201, 'تم إرسال رسالتك بنجاح', { id: newContact._id });
}));

// Get contact messages (for admin)
router.get('/contacts', asyncHandler(async (req, res) => {
  const contacts = await Contacts.find().sort({ date: -1 });
  res.success(200, 'تم جلب الرسائل بنجاح', contacts);
}));

// Get single article by ID
router.get('/articles/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Try to find by MongoDB _id first, then by custom id field
  let article = await Articles.findById(id).catch(() => null);
  if (!article) {
    article = await Articles.findOne({ id: id });
  }
  
  if (!article) {
    return res.error(404, 'المقال غير موجود');
  }
  
  res.success(200, 'تم جلب المقال بنجاح', normalizeDocument(article));
}));

// Get single conversation by ID
router.get('/conversations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Try to find by MongoDB _id first, then by custom id field
  let conversation = await Conversations.findById(id).catch(() => null);
  if (!conversation) {
    conversation = await Conversations.findOne({ id: id });
  }
  
  if (!conversation) {
    return res.error(404, 'الحوار غير موجود');
  }
  
  res.success(200, 'تم جلب الحوار بنجاح', normalizeDocument(conversation));
}));

// Get single news by ID
router.get('/news/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Try to find by MongoDB _id first, then by custom id field
  let news = await News.findById(id).catch(() => null);
  if (!news) {
    news = await News.findOne({ id: id });
  }
  
  if (!news) {
    return res.error(404, 'الخبر غير موجود');
  }
  
  res.success(200, 'تم جلب الخبر بنجاح', normalizeDocument(news));
}));

// ==================== COMMENTS ROUTES ====================

// Get comments for a specific content item
router.get('/comments/:contentType/:contentId', asyncHandler(async (req, res) => {
  const { contentType, contentId } = req.params;
  
  // Validate contentType
  if (!['article', 'news', 'conversation'].includes(contentType)) {
    return res.error(400, 'نوع المحتوى غير صحيح');
  }
  
  const comments = await Comments.find({
    contentType,
    contentId,
    approved: true // Only return approved comments
  }).sort({ createdAt: -1 });
  
  res.success(200, 'تم جلب التعليقات بنجاح', comments);
}));

// Create a new comment
router.post('/comments', sanitizeInput, validate(commentValidation), asyncHandler(async (req, res) => {
  const { contentType, contentId, name, email, comment } = req.body;
  
  // Create new comment (default: not approved, needs admin approval)
  const newComment = new Comments({
    contentType,
    contentId: contentId.toString(),
    name: name.trim(),
    email: email ? email.trim() : '',
    comment: comment.trim(),
    approved: false
  });
  
  const savedComment = await newComment.save();
  
  logger.info('New comment created', { contentType, contentId, name });
  res.success(201, 'تم إضافة التعليق بنجاح، سيتم مراجعته قريباً', {
    ...savedComment.toObject(),
    id: savedComment._id.toString()
  });
}));

// Get comment count for content (for admin purposes)
router.get('/comments/:contentType/:contentId/count', asyncHandler(async (req, res) => {
  const { contentType, contentId } = req.params;
  
  const totalCount = await Comments.countDocuments({ contentType, contentId });
  const approvedCount = await Comments.countDocuments({ 
    contentType, 
    contentId, 
    approved: true 
  });
  
  res.success(200, 'تم جلب عدد التعليقات بنجاح', { 
    total: totalCount, 
    approved: approvedCount 
  });
}));

// ==================== TICKER NEWS ENDPOINTS ====================

// GET active family ticker news headlines
router.get('/ticker/family-news', asyncHandler(async (req, res) => {
  const items = await FamilyTickerNews.find({ active: true })
    .sort({ order: 1, createdAt: -1 })
    .select('headline');
  
  const headlines = items.map(item => item.headline);
  
  // Fallback to default headlines if database is empty
  if (headlines.length === 0) {
    const defaultHeadlines = [
      "تهنئة لنجاح الطالبة ليان الشاعر بالثانوية العامة 🎓",
      "اجتماع العائلة السنوي يوم الجمعة القادم في نابلس 🕌",
      "صدور كتاب جديد للدكتور محمد الشاعر 📘"
    ];
    return res.success(200, 'تم جلب أخبار الشريط العائلي', defaultHeadlines);
  }
  
  res.success(200, 'تم جلب أخبار الشريط العائلي', headlines);
}));

// GET Palestine news headlines (server-side proxy to avoid CORS)
router.get('/ticker/palestine-news', asyncHandler(async (req, res) => {
  const gnewsApiKey = process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY;
  const newsApiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;
  
  // Try GNews.io first (better for Arabic news)
  if (gnewsApiKey) {
    try {
      // Try Arabic search first
      const gnewsUrlAr = `https://gnews.io/api/v4/search?q=فلسطين OR غزة OR القدس OR الضفة&lang=ar&token=${gnewsApiKey}&max=20`;
      const responseAr = await fetch(gnewsUrlAr, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (responseAr.ok) {
        const dataAr = await responseAr.json();
        
        if (dataAr.articles && Array.isArray(dataAr.articles) && dataAr.articles.length > 0) {
          const headlines = dataAr.articles
            .map(article => article.title?.trim())
            .filter(title => title && title.length > 10 && title.length < 200)
            .slice(0, 10);
          
          if (headlines.length > 0) {
            logger.info(`GNews.io (Arabic): Retrieved ${headlines.length} headlines`);
            return res.success(200, 'تم جلب أخبار فلسطين بنجاح', headlines);
          }
        }
      }
      
      // If Arabic search fails, try English search
      const gnewsUrlEn = `https://gnews.io/api/v4/search?q=Palestine OR Gaza OR "West Bank" OR "Palestinian"&lang=en&token=${gnewsApiKey}&max=20`;
      const responseEn = await fetch(gnewsUrlEn, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (responseEn.ok) {
        const dataEn = await responseEn.json();
        
        if (dataEn.articles && Array.isArray(dataEn.articles) && dataEn.articles.length > 0) {
          const headlines = dataEn.articles
            .filter(article => {
              const title = (article.title || '').toLowerCase();
              const desc = (article.description || '').toLowerCase();
              return title.includes('palestine') || 
                     title.includes('gaza') || 
                     title.includes('west bank') ||
                     desc.includes('palestine') ||
                     desc.includes('gaza');
            })
            .map(article => article.title?.trim())
            .filter(title => title && title.length > 10 && title.length < 200)
            .slice(0, 10);
          
          if (headlines.length > 0) {
            logger.info(`GNews.io (English): Retrieved ${headlines.length} headlines`);
            return res.success(200, 'تم جلب أخبار فلسطين بنجاح', headlines);
          }
        }
      }
      
      logger.warn('GNews.io returned no articles or invalid response');
    } catch (gnewsError) {
      logger.error('GNews.io error:', gnewsError);
    }
  }
  
  // Try NewsAPI.org as fallback
  if (newsApiKey) {
    try {
      const newsApiUrl = `https://newsapi.org/v2/everything?q=Palestine OR Gaza OR "West Bank" OR "Palestinian"&language=ar&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`;
      const newsApiResponse = await fetch(newsApiUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (newsApiResponse.ok) {
        const newsApiData = await newsApiResponse.json();
        
        if (newsApiData.articles && Array.isArray(newsApiData.articles) && newsApiData.articles.length > 0) {
          const headlines = newsApiData.articles
            .filter(article => {
              const title = (article.title || '').toLowerCase();
              const desc = (article.description || '').toLowerCase();
              return title.includes('palestine') || 
                     title.includes('gaza') || 
                     title.includes('west bank') ||
                     title.includes('فلسطين') ||
                     desc.includes('palestine') ||
                     desc.includes('gaza');
            })
            .map(article => article.title?.trim())
            .filter(title => title && title.length > 10 && title.length < 200)
            .slice(0, 10);
          
          if (headlines.length > 0) {
            logger.info(`NewsAPI.org: Retrieved ${headlines.length} headlines`);
            return res.success(200, 'تم جلب أخبار فلسطين بنجاح', headlines);
          }
        }
      } else {
        const errorData = await newsApiResponse.json().catch(() => ({}));
        logger.error('NewsAPI.org error:', { status: newsApiResponse.status, errorData });
      }
    } catch (newsApiError) {
      logger.error('NewsAPI.org error:', newsApiError);
    }
  }
  
  // If no API keys, return empty array (graceful degradation)
  if (!gnewsApiKey && !newsApiKey) {
    logger.warn('No news API keys found. Please add GNEWS_API_KEY or NEWS_API_KEY to .env file');
    return res.success(200, 'لا توجد أخبار متاحة حالياً', []);
  }
  
  // Return empty array if all APIs failed
  logger.warn('No real news retrieved from any API source');
  return res.success(200, 'لا توجد أخبار متاحة حالياً', []);
}));

module.exports = router;

