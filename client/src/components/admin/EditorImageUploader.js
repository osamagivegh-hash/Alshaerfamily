export const uploadEditorImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/upload/editor-image', { method: 'POST', body: formData });
  const data = await res.json();
  if (data.url) return data.url;
  throw new Error('فشل رفع الصورة');
};
