const express = require('express');
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

// Sample data for sections
const sampleData = {
  news: [
    {
      id: 1,
      title: "احتفال عائلة الشاعر بالعيد",
      content: "احتفلت عائلة الشاعر بعيد الفطر المبارك في جو من الفرح والسرور، حيث اجتمع جميع أفراد العائلة في بيت الجد الكبير.",
      date: "2024-04-10",
      author: "أحمد الشاعر"
    },
    {
      id: 2,
      title: "زواج محمد الشاعر",
      content: "تم الاحتفال بزواج محمد الشاعر من كريمة عائلة النجار في حفل بهيج حضره جميع أفراد العائلة والأصدقاء.",
      date: "2024-03-15",
      author: "فاطمة الشاعر"
    }
  ],
  conversations: [
    {
      id: 1,
      title: "حوار مع الجد حول تاريخ العائلة",
      participants: ["الجد عبد الله الشاعر", "أحمد الشاعر"],
      content: "في هذا الحوار الشيق، يحكي لنا الجد عبد الله عن تاريخ عائلة الشاعر وأصولها العريقة في فلسطين.",
      date: "2024-02-20"
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

// Get all sections data
router.get('/sections', async (req, res) => {
  try {
    const sections = {};
    
    // Fetch data from MongoDB collections
    sections.news = await News.find().sort({ date: -1 }).limit(10);
    sections.conversations = await Conversations.find().sort({ date: -1 }).limit(10);
    sections.articles = await Articles.find().sort({ date: -1 }).limit(10);
    sections.palestine = await Palestine.find().sort({ createdAt: -1 });
    sections.gallery = await Gallery.find().sort({ createdAt: -1 });
    
    // Get family tree
    const familyTree = await FamilyTree.findOne();
    sections.familyTree = familyTree || { patriarch: '', generations: [] };
    
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
        data = await News.find().sort({ date: -1 }).limit(10);
        break;
      case 'conversations':
        data = await Conversations.find().sort({ date: -1 }).limit(10);
        break;
      case 'articles':
        data = await Articles.find().sort({ date: -1 }).limit(10);
        break;
      case 'palestine':
        data = await Palestine.find().sort({ createdAt: -1 });
        break;
      case 'gallery':
        data = await Gallery.find().sort({ createdAt: -1 });
        break;
      case 'familyTree':
        const familyTree = await FamilyTree.findOne();
        data = familyTree || { patriarch: '', generations: [] };
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

module.exports = router;
