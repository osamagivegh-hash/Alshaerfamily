export const NEWS_CATEGORY_OPTIONS = [
  { value: 'obituaries', label: 'الوفيات' },
  { value: 'occasions', label: 'المناسبات' },
  { value: 'events', label: 'الفعاليات والإنجازات' }
];

export const NEWS_CATEGORY_LABELS = NEWS_CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.value] = category.label;
  return acc;
}, {});

const CATEGORY_ALIASES = {
  obituaries: ['obituaries', 'وفيات', 'الوفيات'],
  occasions: ['occasions', 'المناسبات', 'مناسبات'],
  events: [
    'events',
    'event',
    'الفعاليات',
    'فعاليات',
    'الفعاليات والإنجازات',
    'الفعاليات والانجازات',
    'الانجازات',
    'الإنجازات'
  ]
};

export const resolveNewsCategory = (value) => {
  if (!value) return null;
  const input = value.toString().trim().toLowerCase();
  if (!input) return null;

  for (const [slug, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some(alias => alias.toLowerCase() === input)) {
      return slug;
    }
  }

  return null;
};

export const formatNewsCategory = (value) => {
  const resolved = resolveNewsCategory(value);
  if (!resolved) return null;
  return NEWS_CATEGORY_LABELS[resolved] || null;
};

