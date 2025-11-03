// Central data export file
import { articlesData, getArticleById, getRelatedArticles, getAllArticles } from './articles'
import { dialoguesData, getDialogueById, getRelatedDialogues, getAllDialogues } from './dialogues'
import { newsData, getNewsById, getRelatedNews, getAllNews } from './news'

// Export individual data arrays
export { articlesData, dialoguesData, newsData }

// Export helper functions
export { 
  getArticleById, 
  getRelatedArticles, 
  getAllArticles,
  getDialogueById, 
  getRelatedDialogues, 
  getAllDialogues,
  getNewsById, 
  getRelatedNews, 
  getAllNews 
}

// Static sections data for API fallback
export const getStaticSections = () => {
  return {
    articles: articlesData,
    conversations: dialoguesData,
    news: newsData,
    familyTree: {
      name: "عائلة الشاعر",
      description: "شجرة عائلة الشاعر الفلسطينية العريقة",
      generations: [
        {
          level: 1,
          members: [
            {
              name: "الحاج محمد الشاعر",
              role: "جد العائلة",
              birthYear: "1920",
              location: "الخليل، فلسطين",
              children: 8
            }
          ]
        },
        {
          level: 2,
          members: [
            {
              name: "أحمد محمد الشاعر",
              role: "الابن الأكبر",
              birthYear: "1945",
              location: "عمان، الأردن",
              children: 6
            },
            {
              name: "فاطمة محمد الشاعر",
              role: "الابنة الكبرى",
              birthYear: "1947",
              location: "دمشق، سوريا",
              children: 4
            }
          ]
        }
      ]
    },
    palestine: [
      {
        id: "1",
        title: "ذكريات من الخليل",
        description: "صور وذكريات من مدينة الخليل، مسقط رأس عائلة الشاعر، المدينة المقدسة التي تحمل في طياتها تاريخاً عريقاً",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop&auto=format",
        type: "memories",
        gallery: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1509641498745-13c26fd1ed89?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&h=800&fit=crop&auto=format"
        ]
      },
      {
        id: "2", 
        title: "التراث الفلسطيني",
        description: "مجموعة من القطع التراثية الفلسطينية المحفوظة في العائلة عبر الأجيال",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=600&fit=crop&auto=format",
        type: "heritage",
        gallery: [
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop&auto=format"
        ]
      },
      {
        id: "3",
        title: "أشجار الزيتون المباركة",
        description: "صور لأشجار الزيتون الفلسطينية التي تمثل ارتباطنا بالأرض والتراث",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop&auto=format",
        type: "heritage",
        gallery: [
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&auto=format"
        ]
      },
      {
        id: "4",
        title: "القدس الشريف",
        description: "صور من مدينة القدس، المدينة المقدسة التي تجمعنا جميعاً",
        image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&h=600&fit=crop&auto=format",
        type: "memories",
        gallery: [
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&auto=format"
        ]
      }
    ],
    gallery: [
      {
        id: "1",
        title: "التجمع العائلي الكبير 2024",
        description: "صور من التجمع العائلي في عمان الذي جمع أكثر من 200 فرد من جميع أنحاء العالم",
        images: [
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=800&fit=crop&auto=format"
        ],
        date: "2024-01-25",
        category: "عائلية"
      },
      {
        id: "2",
        title: "حفل تخرج الأحفاد",
        description: "احتفال بتخرج أحفاد العائلة من الجامعات في كندا وأمريكا",
        images: [
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=800&fit=crop&auto=format"
        ],
        date: "2024-06-15",
        category: "تعليمية"
      },
      {
        id: "3",
        title: "صور من فلسطين التاريخية",
        description: "مجموعة من الصور التراثية من فلسطين والخليل",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1509641498745-13c26fd1ed89?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=800&fit=crop&auto=format"
        ],
        date: "2024-03-10",
        category: "تراثية"
      },
      {
        id: "4",
        title: "أشجار الزيتون في فلسطين",
        description: "صور لأشجار الزيتون المقدسة في أرض فلسطين",
        images: [
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&auto=format"
        ],
        date: "2024-04-20",
        category: "فلسطين"
      },
      {
        id: "5",
        title: "الاحتفالات الدينية",
        description: "صور من احتفالات العائلة بالمناسبات الدينية",
        images: [
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop&auto=format"
        ],
        date: "2024-04-10",
        category: "دينية"
      },
      {
        id: "6",
        title: "البيت القديم في الخليل",
        description: "صور من البيت القديم للعائلة في مدينة الخليل",
        images: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&auto=format",
          "https://images.unsplash.com/photo-1509641498745-13c26fd1ed89?w=1200&h=800&fit=crop&auto=format"
        ],
        date: "2024-02-15",
        category: "تراثية"
      }
    ]
  }
}