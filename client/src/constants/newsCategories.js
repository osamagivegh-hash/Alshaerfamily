export const NEWS_CATEGORY_OPTIONS = [
  { value: 'General', label: '📰 الأخبار العامة' },
  { value: 'Obituaries', label: '🕊️ الوفيات' },
  { value: 'Events', label: '🎉 الفعاليات' },
  { value: 'Celebrations', label: '🎈 المناسبات' },
  { value: 'Other', label: '⚙️ أخرى' }
];

export const NEWS_CATEGORY_LABELS = NEWS_CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.value] = category.label.replace(/^[^\s]+\s/, '').trim() || category.label;
  return acc;
}, {});

const CATEGORY_ALIAS_MAP = {
  general: 'General',
  '📰 الأخبار العامة': 'General',
  الأخبار: 'General',
  الوفيات: 'Obituaries',
  وفيات: 'Obituaries',
  obituaries: 'Obituaries',
  events: 'Events',
  event: 'Events',
  الفعاليات: 'Events',
  فعاليات: 'Events',
  celebrations: 'Celebrations',
  celebration: 'Celebrations',
  المناسبات: 'Celebrations',
  مناسبات: 'Celebrations',
  other: 'Other',
  أخرى: 'Other',
  اخرى: 'Other'
};

export const resolveNewsCategory = (value) => {
  if (!value) return null;
  const input = value.toString().trim();
  if (!input) return null;

  const exactMatch = NEWS_CATEGORY_OPTIONS.find(option => option.value === input);
  if (exactMatch) return exactMatch.value;

  const normalized = input.toLowerCase();
  return CATEGORY_ALIAS_MAP[normalized] || null;
};

export const formatNewsCategory = (value) => {
  const resolved = resolveNewsCategory(value);
  if (!resolved) return null;
  return NEWS_CATEGORY_LABELS[resolved] || NEWS_CATEGORY_OPTIONS.find(option => option.value === resolved)?.label || resolved;
};

