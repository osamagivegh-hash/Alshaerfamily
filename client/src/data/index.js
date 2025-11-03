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
        description: "صور وذكريات من مدينة الخليل، مسقط رأس عائلة الشاعر",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
        type: "memories"
      },
      {
        id: "2", 
        title: "التراث الفلسطيني",
        description: "مجموعة من القطع التراثية الفلسطينية المحفوظة في العائلة",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=400&fit=crop",
        type: "heritage"
      }
    ],
    gallery: [
      {
        id: "1",
        title: "التجمع العائلي الكبير 2024",
        description: "صور من التجمع العائلي في عمان",
        images: [
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1577563908411-5c350d0d3c56?w=800&h=600&fit=crop"
        ],
        date: "2024-01-25"
      },
      {
        id: "2",
        title: "حفل تخرج الأحفاد",
        description: "احتفال بتخرج أحفاد العائلة من الجامعات",
        images: [
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
        ],
        date: "2024-06-15"
      }
    ]
  }
}