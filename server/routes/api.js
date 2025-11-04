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
router.get('/sections', async (req, res) => {
  try {
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
    
    res.json(sections);
  } catch (error) {
    console.error('API sections error:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// Get specific section data
router.get('/sections/:section', async (req, res) => {
  try {
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
        return res.status(404).json({ message: 'القسم غير موجود' });
    }
    
    res.json(data);
  } catch (error) {
    console.error(`API section ${req.params.section} error:`, error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// Handle contact form submissions
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    
    const newContact = new Contacts({
      name,
      email,
      message,
      status: 'new'
    });
    
    await newContact.save();
    
    res.json({ message: 'تم إرسال رسالتك بنجاح', success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'خطأ في إرسال الرسالة' });
  }
});

// Get contact messages (for admin)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contacts.find().sort({ date: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'خطأ في جلب الرسائل' });
  }
});

// Get single article by ID
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB _id first, then by custom id field
    let article = await Articles.findById(id).catch(() => null);
    if (!article) {
      article = await Articles.findOne({ id: id });
    }
    
    if (!article) {
      return res.status(404).json({ message: 'المقال غير موجود' });
    }
    
    res.json(normalizeDocument(article));
  } catch (error) {
    console.error('Error reading article:', error);
    res.status(500).json({ message: 'خطأ في قراءة المقال' });
  }
});

// Get single conversation by ID
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB _id first, then by custom id field
    let conversation = await Conversations.findById(id).catch(() => null);
    if (!conversation) {
      conversation = await Conversations.findOne({ id: id });
    }
    
    if (!conversation) {
      return res.status(404).json({ message: 'الحوار غير موجود' });
    }
    
    res.json(normalizeDocument(conversation));
  } catch (error) {
    console.error('Error reading conversation:', error);
    res.status(500).json({ message: 'خطأ في قراءة الحوار' });
  }
});

// Get single news by ID
router.get('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB _id first, then by custom id field
    let news = await News.findById(id).catch(() => null);
    if (!news) {
      news = await News.findOne({ id: id });
    }
    
    if (!news) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }
    
    res.json(normalizeDocument(news));
  } catch (error) {
    console.error('Error reading news:', error);
    res.status(500).json({ message: 'خطأ في قراءة الخبر' });
  }
});

// ==================== COMMENTS ROUTES ====================

// Get comments for a specific content item
router.get('/comments/:contentType/:contentId', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    // Validate contentType
    if (!['article', 'news', 'conversation'].includes(contentType)) {
      return res.status(400).json({ message: 'نوع المحتوى غير صحيح' });
    }
    
    const comments = await Comments.find({
      contentType,
      contentId,
      approved: true // Only return approved comments
    }).sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'خطأ في جلب التعليقات' });
  }
});

// Create a new comment
router.post('/comments', async (req, res) => {
  try {
    const { contentType, contentId, name, email, comment } = req.body;
    
    // Validation
    if (!contentType || !contentId || !name || !comment) {
      return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }
    
    if (!['article', 'news', 'conversation'].includes(contentType)) {
      return res.status(400).json({ message: 'نوع المحتوى غير صحيح' });
    }
    
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
    
    res.status(201).json({
      ...savedComment.toObject(),
      id: savedComment._id.toString(),
      _id: savedComment._id.toString()
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'خطأ في إضافة التعليق' });
  }
});

// Get comment count for content (for admin purposes)
router.get('/comments/:contentType/:contentId/count', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    const totalCount = await Comments.countDocuments({ contentType, contentId });
    const approvedCount = await Comments.countDocuments({ 
      contentType, 
      contentId, 
      approved: true 
    });
    
    res.json({ total: totalCount, approved: approvedCount });
  } catch (error) {
    console.error('Error counting comments:', error);
    res.status(500).json({ message: 'خطأ في حساب التعليقات' });
  }
});

// ==================== TICKER NEWS ENDPOINTS ====================

// GET active family ticker news headlines
router.get('/ticker/family-news', async (req, res) => {
  try {
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
      return res.json(defaultHeadlines);
    }
    
    res.json(headlines);
  } catch (error) {
    console.error('Error fetching family ticker news:', error);
    // Fallback to default headlines on error
    const defaultHeadlines = [
      "تهنئة لنجاح الطالبة ليان الشاعر بالثانوية العامة 🎓",
      "اجتماع العائلة السنوي يوم الجمعة القادم في نابلس 🕌",
      "صدور كتاب جديد للدكتور محمد الشاعر 📘"
    ];
    res.json(defaultHeadlines);
  }
});

// GET Palestine news headlines (server-side proxy to avoid CORS)
router.get('/ticker/palestine-news', async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY || process.env.NEWS_API_KEY || process.env.VITE_GNEWS_API_KEY || process.env.VITE_NEWS_API_KEY;
    
    if (!apiKey) {
      console.warn('News API key not found. Returning fallback headlines.');
      return res.json([
        "تحديثات مباشرة من فلسطين 🇵🇸",
        "أخبار فلسطين اليوم",
        "فلسطين في قلبنا دائماً 🇵🇸"
      ]);
    }

    // Try GNews.io first
    const gnewsUrl = `https://gnews.io/api/v4/search?q=Palestine OR فلسطين OR غزة OR القدس&lang=ar&token=${apiKey}&max=15`;
    
    try {
      const response = await fetch(gnewsUrl);
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        // Get all headlines, no need to filter since we're already searching for Palestine
        const headlines = data.articles
          .map(article => article.title)
          .filter(title => title && title.trim().length > 0 && title.length < 200) // Filter out very long titles
          .slice(0, 10);
        
        if (headlines.length > 0) {
          return res.json(headlines);
        }
      }
      
      // If no articles, try with English search
      const gnewsUrlEn = `https://gnews.io/api/v4/search?q=Palestine&lang=en&token=${apiKey}&max=15`;
      const responseEn = await fetch(gnewsUrlEn);
      const dataEn = await responseEn.json();
      
      if (dataEn.articles && dataEn.articles.length > 0) {
        // Filter for Palestine-related articles
        const palestineHeadlines = dataEn.articles
          .filter(article => 
            article.title?.toLowerCase().includes('palestine') ||
            article.title?.toLowerCase().includes('gaza') ||
            article.title?.toLowerCase().includes('west bank') ||
            article.description?.toLowerCase().includes('palestine')
          )
          .map(article => article.title)
          .filter(title => title && title.trim().length > 0 && title.length < 200)
          .slice(0, 10);
        
        if (palestineHeadlines.length > 0) {
          return res.json(palestineHeadlines);
        }
      }
    } catch (gnewsError) {
      console.warn('GNews.io failed, trying NewsAPI.org...', gnewsError.message);
      
      // Try NewsAPI.org as fallback
      try {
        const newsApiUrl = `https://newsapi.org/v2/everything?q=Palestine OR Gaza OR "West Bank"&language=ar&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
        const newsApiResponse = await fetch(newsApiUrl);
        
        if (newsApiResponse.ok) {
          const newsApiData = await newsApiResponse.json();
          
          if (newsApiData.articles && newsApiData.articles.length > 0) {
            const headlines = newsApiData.articles
              .map(article => article.title)
              .filter(title => title && title.trim().length > 0 && title.length < 200)
              .slice(0, 10);
            
            if (headlines.length > 0) {
              return res.json(headlines);
            }
          }
        }
      } catch (newsApiError) {
        console.error('NewsAPI.org also failed:', newsApiError.message);
      }
    }
    
    // If all APIs fail, return fallback
    res.json([
      "تحديثات مباشرة من فلسطين 🇵🇸",
      "أخبار فلسطين اليوم",
      "فلسطين في قلبنا دائماً 🇵🇸"
    ]);
  } catch (error) {
    console.error('Error fetching Palestine news:', error);
    res.json([
      "تحديثات مباشرة من فلسطين 🇵🇸",
      "أخبار فلسطين اليوم",
      "فلسطين في قلبنا دائماً 🇵🇸"
    ]);
  }
});

module.exports = router;
