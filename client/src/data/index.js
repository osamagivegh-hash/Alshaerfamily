import { articles, getArticleById, getRelatedArticles } from './articles'
import { dialogues, getDialogueById, getRelatedDialogues } from './dialogues'
import { newsItems, getNewsById, getRelatedNews } from './news'

export const sectionsData = {
  news: newsItems,
  conversations: dialogues,
  articles,
  palestine: [],
  gallery: [],
  familyTree: {},
}

export const getStaticSections = () => ({
  news: [...newsItems],
  conversations: [...dialogues],
  articles: [...articles],
  palestine: [],
  gallery: [],
  familyTree: {},
})

export {
  articles,
  dialogues,
  newsItems,
  getArticleById,
  getRelatedArticles,
  getDialogueById,
  getRelatedDialogues,
  getNewsById,
  getRelatedNews,
}
