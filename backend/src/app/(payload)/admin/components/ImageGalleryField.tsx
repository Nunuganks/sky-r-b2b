'use client';

import React, { useState, useEffect } from 'react';

interface ImageGalleryFieldProps {
  value?: any[];
  onChange?: (value: any[]) => void;
}

const ImageGalleryField: React.FC<ImageGalleryFieldProps> = ({ value = [], onChange }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const images = value || [];

  const handleImageDelete = (imageId: string) => {
    const newImages = images.filter((img: any) => img.id !== imageId);
    onChange?.(newImages);
  };

  const handleMainImageChange = (imageId: string) => {
    const newImages = images.map((img: any) => ({
      ...img,
      isMain: img.id === imageId
    }));
    onChange?.(newImages);
  };

  const handleImageSelect = (imageId: string, selected: boolean) => {
    if (selected) {
      setSelectedImages(prev => [...prev, imageId]);
    } else {
      setSelectedImages(prev => prev.filter(id => id !== imageId));
    }
  };

  const handleDelete = (imageId: string) => {
    setImageToDelete(imageId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      handleImageDelete(imageToDelete);
      setImageToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleBulkDelete = () => {
    if (selectedImages.length > 0) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmBulkDelete = () => {
    selectedImages.forEach(imageId => {
      handleImageDelete(imageId);
    });
    setSelectedImages([]);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Tools Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Images</h3>
        {selectedImages.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Инструменти ({selectedImages.length})
          </button>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-6 gap-4">
        {images.map((image: any, index: number) => (
          <div key={image.id || index} className="relative group">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={image.image?.url || image.url}
                alt={image.alt || image.filename || 'Product image'}
                className="w-full h-full object-contain"
              />
              
              {/* Main Image Label */}
              {image.isMain && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Основен
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageSelect(image.id || index.toString(), !selectedImages.includes(image.id || index.toString()));
                    }}
                    className="bg-white text-gray-700 p-1 rounded hover:bg-gray-100"
                    title="Select"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMainImageChange(image.id || index.toString());
                    }}
                    className="bg-white text-gray-700 p-1 rounded hover:bg-gray-100"
                    title="Set as Main"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id || index.toString());
                    }}
                    className="bg-white text-red-600 p-1 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Selection Checkbox */}
              {selectedImages.includes(image.id || index.toString()) && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              {imageToDelete ? 'Премахване на медиен файл?' : `Премахване на ${selectedImages.length} изображения?`}
            </h3>
            <p className="text-gray-600 mb-6">
              {imageToDelete 
                ? 'Сигурни ли сте, че искате да премахнете това изображение?'
                : 'Сигурни ли сте, че искате да премахнете избраните изображения?'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setImageToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                onClick={imageToDelete ? confirmDelete : confirmBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Премахване
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryField; 