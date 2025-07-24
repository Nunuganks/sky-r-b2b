'use client';

import React, { useState } from 'react';

interface ImageEditModalProps {
  image: {
    id: string;
    url: string;
    filename: string;
    alt?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageId: string, data: { alt: string; isMain: boolean }) => void;
  isMain?: boolean;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
  image,
  isOpen,
  onClose,
  onSave,
  isMain = false,
}) => {
  const [alt, setAlt] = useState(image.alt || '');
  const [isMainImage, setIsMainImage] = useState(isMain);

  const handleSave = () => {
    onSave(image.id, {
      alt,
      isMain: isMainImage,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Редактиране на изображение</h2>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отказ
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Запази
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Image Preview */}
          <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
            <img
              src={image.url}
              alt={alt || image.filename}
              className="max-w-full max-h-96 object-contain"
            />
          </div>

          {/* Settings Panel */}
          <div className="w-80 p-6 border-l border-gray-200">
            <div className="space-y-6">
              {/* Main Image Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Направете това основна снимка на продукта
                </label>
                <button
                  onClick={() => setIsMainImage(!isMainImage)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isMainImage ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isMainImage ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Alt Text Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt текст за изображението
                </label>
                <textarea
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Описание на изображението..."
                />
              </div>

              {/* Image Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Информация за файла</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Име:</strong> {image.filename}</p>
                  <p><strong>Размер:</strong> {image.url.includes('http') ? 'Външен линк' : 'Локален файл'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal; 