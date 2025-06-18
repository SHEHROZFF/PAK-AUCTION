'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAuctions,
  createAuction,
  updateAuction,
  deleteAuction,
  setSearch,
  setCategory,
  setStatus,
  setPage
} from '@/store/slices/auctionsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { apiService } from '@/services/apiService';

interface AuctionFormData {
  title: string;
  description: string;
  brand: string;
  condition: string;
  basePrice: number;
  bidIncrement: number;
  entryFee: number;
  reservePrice: number;
  buyNowPrice: number;
  categoryId: string;
  startTime: string;
  endTime: string;
  isFeatured: boolean;
  images: any[];
}

interface ImageData {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

interface AuctionModalProps {
  auction: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (auctionData: AuctionFormData) => void;
  categories: any[];
}

function AuctionModal({ auction, isOpen, onClose, onSave, categories }: AuctionModalProps) {
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    brand: '',
    condition: 'NEW',
    basePrice: 0,
    bidIncrement: 10,
    entryFee: 0,
    reservePrice: 0,
    buyNowPrice: 0,
    categoryId: '',
    startTime: '',
    endTime: '',
    isFeatured: false,
    images: []
  });

  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [originalImages, setOriginalImages] = useState<ImageData[]>([]);

  useEffect(() => {
    if (auction) {
      console.log('=== DEBUGGING CATEGORY ISSUE ===');
      console.log('Full auction object:', JSON.stringify(auction, null, 2));
      console.log('auction.categoryId:', auction.categoryId);
      console.log('auction.category:', auction.category);
      console.log('auction.category?.id:', auction.category?.id);
      console.log('auction.category?._id:', auction.category?._id);
      console.log('Available categories:', categories);
      
      // Try all possible category ID sources
      let categoryId = '';
      if (auction.categoryId) {
        if (typeof auction.categoryId === 'object' && auction.categoryId._id) {
          categoryId = auction.categoryId._id;
          console.log('Using auction.categoryId._id:', categoryId);
        } else if (typeof auction.categoryId === 'string') {
          categoryId = auction.categoryId;
          console.log('Using auction.categoryId as string:', categoryId);
        }
      } else if (auction.category?._id) {
        categoryId = auction.category._id;
        console.log('Using auction.category._id:', categoryId);
      } else if (auction.category?.id) {
        categoryId = auction.category.id;
        console.log('Using auction.category.id:', categoryId);
      } else if (typeof auction.category === 'string') {
        categoryId = auction.category;
        console.log('Using auction.category as string:', categoryId);
      }
      
      console.log('Final categoryId to use:', categoryId);
      console.log('=== END DEBUGGING ===');
      
      setFormData({
        title: auction.title || '',
        description: auction.description || '',
        brand: auction.brand || '',
        condition: auction.condition || 'NEW',
        basePrice: auction.basePrice || 0,
        bidIncrement: auction.bidIncrement || 10,
        entryFee: auction.entryFee || 0,
        reservePrice: auction.reservePrice || 0,
        buyNowPrice: auction.buyNowPrice || 0,
        categoryId: categoryId,
        startTime: auction.startTime ? new Date(auction.startTime).toISOString().slice(0, 16) : '',
        endTime: auction.endTime ? new Date(auction.endTime).toISOString().slice(0, 16) : '',
        isFeatured: auction.isFeatured || false,
        images: auction.images || []
      });
      
      // Handle images
      if (auction.images && auction.images.length > 0) {
        const existingImages = auction.images.map((img: any) => {
          return {
            url: img.url,
            filename: img.filename || img.url.split('/').pop(),
            originalName: img.originalName || img.filename || 'image',
            size: img.size || 0
          };
        });
        setUploadedImages(existingImages);
        setOriginalImages(existingImages);
      } else {
        setUploadedImages([]);
        setOriginalImages([]);
      }
    } else {
      // Reset form for new auction
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      setFormData({
        title: '',
        description: '',
        brand: '',
        condition: 'NEW',
        basePrice: 0,
        bidIncrement: 10,
        entryFee: 0,
        reservePrice: 0,
        buyNowPrice: 0,
        categoryId: '',
        startTime: tomorrow.toISOString().slice(0, 16),
        endTime: nextWeek.toISOString().slice(0, 16),
        isFeatured: false,
        images: []
      });
      setUploadedImages([]);
      setOriginalImages([]);
    }
    setUploadError(null);
  }, [auction, isOpen, categories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total images limit
    if (uploadedImages.length + files.length > 5) {
      setUploadError('Maximum 5 images allowed');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await apiService.uploadImages(files);
      const newImages = response.data.images;
      
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Clear the input
      e.target.value = '';
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate entry fee as 10% of base price if not set
    const finalFormData = {
      ...formData,
      entryFee: formData.entryFee || (formData.basePrice * 0.1),
      images: uploadedImages
    };
    
    onSave(finalFormData);
    onClose();
  };

  const handleInputChange = (field: keyof AuctionFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = async () => {
    // Clean up newly uploaded images if creating new auction and not saving
    if (!auction && uploadedImages.length > 0) {
      try {
        const newlyUploadedFilenames = uploadedImages
          .filter(img => !originalImages.find(orig => orig.filename === img.filename))
          .map(img => img.filename);
        
        if (newlyUploadedFilenames.length > 0) {
          await apiService.cleanupOrphanedImages(newlyUploadedFilenames);
          console.log('Cleaned up orphaned images:', newlyUploadedFilenames);
        }
      } catch (error) {
        console.error('Failed to cleanup orphaned images:', error);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-5xl">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <i className="fas fa-gavel text-white text-lg"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold leading-6 text-white">
                    {auction ? 'Edit Auction' : 'Create New Auction'}
                  </h3>
                  <p className="text-sm text-indigo-100">
                    {auction ? 'Update auction details and settings' : 'Set up a new auction listing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="mt-6 hidden sm:block">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-white/90">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-medium">1</div>
                  <span className="ml-2 text-sm">Basic Info</span>
                </div>
                <div className="h-0.5 w-8 bg-white/30"></div>
                <div className="flex items-center text-white/90">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-medium">2</div>
                  <span className="ml-2 text-sm">Pricing</span>
                </div>
                <div className="h-0.5 w-8 bg-white/30"></div>
                <div className="flex items-center text-white/90">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-medium">3</div>
                  <span className="ml-2 text-sm">Images</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
              {/* Basic Information */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <i className="fas fa-info-circle text-indigo-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="Enter auction title..."
                      required
                      minLength={3}
                      maxLength={100}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.title.length}/100 characters
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      rows={4}
                      placeholder="Provide detailed description of the item..."
                      required
                      minLength={10}
                      maxLength={2000}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="Brand name (optional)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) => handleInputChange('condition', e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        <option value="NEW">Brand New</option>
                        <option value="LIKE_NEW">Like New</option>
                        <option value="EXCELLENT">Excellent</option>
                        <option value="VERY_GOOD">Very Good</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <i className="fas fa-dollar-sign text-green-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Pricing Information</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.basePrice || ''}
                        onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Increment
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.bidIncrement || ''}
                        onChange={(e) => handleInputChange('bidIncrement', parseFloat(e.target.value) || 10)}
                        className="w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="10.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entry Fee
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.entryFee || ''}
                        onChange={(e) => handleInputChange('entryFee', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="Auto: 10% of starting price"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty for auto-calculation (10% of starting price)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reserve Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.reservePrice || ''}
                        onChange={(e) => handleInputChange('reservePrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buy Now Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.buyNowPrice || ''}
                        onChange={(e) => handleInputChange('buyNowPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <i className="fas fa-clock text-blue-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Timing Information</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Featured Status */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                    <i className="fas fa-star text-yellow-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Featured Options</h4>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Mark as Featured</span>
                      <p className="text-xs text-gray-600">
                        Featured auctions appear prominently on the homepage and search results
                      </p>
                    </div>
                  </div>
                  <div className="text-yellow-600">
                    <i className="fas fa-star text-2xl"></i>
                  </div>
                </div>
              </div>

              {/* Image Management */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <i className="fas fa-images text-purple-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Images</h4>
                </div>
                
                {/* Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Images (Maximum 5)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200 ${
                      (isUploading || uploadedImages.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                            <p className="text-sm text-gray-600">Uploading images...</p>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading || uploadedImages.length >= 5}
                      />
                    </label>
                  </div>
                  {uploadError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        {uploadError}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Image Preview */}
                {uploadedImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-sm font-medium text-gray-700">
                        Uploaded Images ({uploadedImages.length}/5)
                      </h5>
                      <span className="text-xs text-gray-500">
                        First image will be used as the main display image
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {uploadedImages.map((image, index) => {
                        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${image.url}`;
                        
                        return (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                              <Image
                                src={imageUrl}
                                alt={image.originalName}
                                width={120}
                                height={120}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                              title="Remove image"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                            
                            {/* Main image badge */}
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                                <i className="fas fa-star mr-1"></i>
                                Main
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                form="auction-form"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('form')?.requestSubmit();
                }}
                disabled={isUploading}
                className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className={`fas ${auction ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                    {auction ? 'Update Auction' : 'Create Auction'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsTab() {
  const dispatch = useAppDispatch();
  const {
    auctions,
    totalAuctions,
    currentPage,
    totalPages,
    limit,
    search,
    category,
    status,
    isLoading
  } = useAppSelector((state: any) => state.auctions);
  
  const { categories } = useAppSelector((state: any) => state.categories);

  const [editingAuction, setEditingAuction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAuctions({
      page: currentPage,
      limit,
      search,
      category,
      status
    }));
    dispatch(fetchCategories());
  }, [dispatch, currentPage, limit, search, category, status]);

  const handleSearch = (searchTerm: string) => {
    dispatch(setSearch(searchTerm));
  };

  const handleCategoryFilter = (categoryFilter: string) => {
    dispatch(setCategory(categoryFilter));
  };

  const handleStatusFilter = (statusFilter: string) => {
    dispatch(setStatus(statusFilter));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const handleCreateAuction = () => {
    setEditingAuction(null);
    setIsModalOpen(true);
  };

  const handleEditAuction = (auction: any) => {
    setEditingAuction(auction);
    setIsModalOpen(true);
  };

  const handleSaveAuction = (auctionData: AuctionFormData) => {
    if (editingAuction) {
      dispatch(updateAuction({ id: editingAuction.id, auctionData }));
    } else {
      dispatch(createAuction(auctionData));
    }
  };

  const handleDeleteAuction = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      dispatch(deleteAuction(id));
    }
  };

  const getStatusBadge = (auctionStatus: string) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
      ENDED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
      SOLD: { bg: 'bg-purple-100', text: 'text-purple-800' }
    };
    
    const config = statusConfig[auctionStatus as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {auctionStatus}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Auction Management</h2>
            <p className="text-gray-600">Manage auction listings and their statuses</p>
          </div>
          <button
            onClick={handleCreateAuction}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Auction
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="ENDED">Ended</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => dispatch(fetchAuctions({ page: currentPage, limit, search, category, status }))}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Auctions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-500">Loading auctions...</span>
                    </div>
                  </td>
                </tr>
              ) : auctions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No auctions found. Create your first auction to get started.
                  </td>
                </tr>
              ) : (
                auctions.map((auction: any) => (
                  <tr key={auction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <Image
                            src={auction.images?.[0]?.url ? `${process.env.NEXT_PUBLIC_API_URL}${auction.images[0].url}` : `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center`}
                            alt={auction.title}
                            width={48}
                            height={48}
                            className="rounded-lg"
                            style={{ width: 48, height: 48, objectFit: 'cover' }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate flex items-center">
                            {auction.title}
                            {auction.isFeatured && (
                              <i className="fas fa-star text-yellow-500 ml-2" title="Featured Auction"></i>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {auction.seller?.firstName} {auction.seller?.lastName}
                          </div>
                          {auction.brand && (
                            <div className="text-xs text-gray-400">
                              Brand: {auction.brand}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {auction.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">Current: ${auction.currentBid?.toLocaleString() || auction.basePrice?.toLocaleString()}</div>
                        <div className="text-gray-500">Base: ${auction.basePrice?.toLocaleString()}</div>
                        {auction.reservePrice > 0 && (
                          <div className="text-gray-500">Reserve: ${auction.reservePrice?.toLocaleString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(auction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>Start: {new Date(auction.startTime).toLocaleDateString()}</div>
                        <div>End: {new Date(auction.endTime).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{auction._count?.bids || 0} bids</div>
                        <div className="text-gray-500">{auction.viewCount || 0} views</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAuction(auction)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit auction"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteAuction(auction.id, auction.title)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete auction"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * limit, totalAuctions)}</span> of{' '}
                  <span className="font-medium">{totalAuctions}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuctionModal
        auction={editingAuction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAuction}
        categories={categories}
      />
    </div>
  );
} 