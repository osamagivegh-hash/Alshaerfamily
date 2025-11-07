import React, { useRef } from 'react';

const ImageUpload = ({ label, value, onChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload/single-image', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) onChange(data.url);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-palestine-black mb-2">{label}</label>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="block w-full"
        onChange={handleFileChange}
      />
      {value && (
        <div className="mt-2">
          <img src={value} alt="preview" className="max-h-32 rounded border shadow" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
