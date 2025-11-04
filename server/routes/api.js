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

// Sample data for sections
const sampleData = {
  news: [
    {
      id: "1",
      title: "تجمع عائلي كبير في عمان يضم أكثر من 200 فرد من عائلة الشاعر",
      headline: "تجمع عائلي كبير في عمان",
      reporter: "أحمد الشاعر",
      date: "2024-01-25",
      summary: "نظمت عائلة الشاعر تجمعاً عائلياً كبيراً في العاصمة الأردنية عمان، حضره أكثر من 200 فرد من مختلف أنحاء العالم، في أكبر لقاء عائلي منذ عقود.",
      content: "شهدت العاصمة الأردنية عمان يوم الجمعة الماضي حدثاً تاريخياً مميزاً، حيث نظمت عائلة الشاعر أكبر تجمع عائلي في تاريخها الحديث، بحضور أكثر من 200 فرد من مختلف أنحاء العالم.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop",
      tags: ["تجمع عائلي", "عمان", "فعاليات", "تراث", "وحدة"],
      category: "أخبار العائلة"
    },
    {
      id: "2",
      title: "د. سامي الشاعر يحصل على جائزة التميز الطبي في كندا",
      headline: "جائزة التميز الطبي لد. سامي الشاعر",
      reporter: "ليلى الشاعر",
      date: "2024-02-18",
      summary: "حصل د. سامي الشاعر، طبيب القلب المتخصص، على جائزة التميز الطبي من الجمعية الكندية لأطباء القلب، تقديراً لإسهاماته في علاج أمراض القلب والأوعية الدموية.",
      content: "حصل د. سامي الشاعر، طبيب القلب والأوعية الدموية المتخصص، على جائزة التميز الطبي من الجمعية الكندية لأطباء القلب، وذلك في حفل أقيم في مدينة تورونتو مساء الجمعة الماضي.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
      tags: ["طب", "جائزة", "كندا", "نجاح", "تميز"],
      category: "إنجازات"
    }
  ],
  conversations: [
    {
      id: "1",
      title: "حوار مع الحاج أبو محمد حول ذكريات فلسطين",
      moderator: "أحمد الشاعر",
      moderatorRole: "مُيسّر الحوار",
      moderatorImage: "https://ui-avatars.com/api/?name=أحمد+الشاعر&background=007A3D&color=fff",
      date: "2024-01-20",
      participants: ["الحاج أبو محمد الشاعر", "أم خليل الشاعر", "د. سامي الشاعر"],
      summary: "حوار مؤثر مع كبار العائلة حول ذكرياتهم في فلسطين قبل النكبة، والحياة في القرى الفلسطينية، والتقاليد التي كانت سائدة.",
      content: "حوار مؤثر مع كبار العائلة حول ذكرياتهم في فلسطين قبل النكبة، والحياة في القرى الفلسطينية، والتقاليد التي كانت سائدة.",
      image: "https://images.unsplash.com/photo-1577563908411-5c350d0d3c56?w=800&h=400&fit=crop",
      tags: ["ذكريات", "تراث", "فلسطين", "كبار السن", "تاريخ شفوي"],
      readingTime: 20
    }
  ],
  articles: [
    {
      id: "1",
      title: "تاريخ عائلة الشاعر في فلسطين",
      author: "أحمد الشاعر",
      authorRole: "باحث في التاريخ الفلسطيني",
      authorImage: "https://ui-avatars.com/api/?name=أحمد+الشاعر&background=007A3D&color=fff",
      date: "2024-01-15",
      summary: "نظرة شاملة على تاريخ عائلة الشاعر وجذورها العريقة في الأراضي الفلسطينية، من القرن السابع عشر وحتى اليوم.",
      content: "تعتبر عائلة الشاعر من العائلات الفلسطينية العريقة التي لها تاريخ طويل في الأراضي الفلسطينية. تشير الوثائق التاريخية إلى أن العائلة استقرت في منطقة الخليل في القرن السابع عشر الميلادي.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
      tags: ["تاريخ", "فلسطين", "تراث", "عائلة"],
      readingTime: 8
    }
  ],
  familyTree: {
    patriarch: "عبد الله الشاعر",
    generations: [
      {
        generation: 1,
        members: ["عبد الله الشاعر", "فاطمة الشاعر (الزوجة)"]
      },
      {
        generation: 2,
        members: ["أحمد الشاعر", "محمد الشاعر", "عائشة الشاعر", "خديجة الشاعر"]
      },
      {
        generation: 3,
        members: ["علي أحمد الشاعر", "سارة محمد الشاعر", "يوسف أحمد الشاعر"]
      }
    ]
  },
  palestine: [
    {
      id: 1,
      title: "جذورنا في فلسطين",
      content: "تنتمي عائلة الشاعر إلى قرية عين كارم في القدس، حيث عاشت لأجيال عديدة قبل النكبة عام 1948.",
      image: "palestine1.jpg"
    },
    {
      id: 2,
      title: "ذكريات الوطن",
      content: "يحتفظ كبار العائلة بذكريات جميلة عن الحياة في فلسطين، من أشجار الزيتون إلى رائحة الياسمين.",
      image: "palestine2.jpg"
    }
  ],
  articles: [
    {
      id: 1,
      title: "أهمية الحفاظ على التراث العائلي",
      author: "د. أحمد الشاعر",
      content: "في عصر العولمة، يصبح الحفاظ على التراث العائلي أمراً بالغ الأهمية لنقل القيم والتقاليد للأجيال القادمة.",
      date: "2024-01-15"
    }
  ],
  gallery: [
    {
      id: 1,
      title: "صور العائلة التاريخية",
      images: ["family1.jpg", "family2.jpg", "family3.jpg"],
      description: "مجموعة من الصور التاريخية لعائلة الشاعر عبر العقود"
    }
  ]
};

// Note: Sample data is now handled by MongoDB initialization script
// Run: cd server && node scripts/initializeData.js to populate sample data

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
    
    // If still not found, return sample data for development
    if (!article) {
      const sampleArticle = sampleData.articles.find(a => a.id === id);
      if (sampleArticle) {
        return res.json(sampleArticle);
      }
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
    
    // If still not found, return sample data for development
    if (!conversation) {
      const sampleConversation = sampleData.conversations.find(c => c.id === id);
      if (sampleConversation) {
        return res.json(sampleConversation);
      }
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
    
    // If still not found, return sample data for development
    if (!news) {
      const sampleNews = sampleData.news.find(n => n.id === id);
      if (sampleNews) {
        return res.json(sampleNews);
      }
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

module.exports = router;
