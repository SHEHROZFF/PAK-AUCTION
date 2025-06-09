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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {auction ? 'Edit Auction' : 'Create New Auction'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="VERY_GOOD">Very Good</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Category</option>
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Pricing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Price ($) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.basePrice || ''}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bid Increment ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.bidIncrement || ''}
                  onChange={(e) => handleInputChange('bidIncrement', parseFloat(e.target.value) || 10)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entryFee || ''}
                  onChange={(e) => handleInputChange('entryFee', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Auto: 10% of starting price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reserve Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.reservePrice || ''}
                  onChange={(e) => handleInputChange('reservePrice', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Now Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.buyNowPrice || ''}
                  onChange={(e) => handleInputChange('buyNowPrice', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Timing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Featured Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Featured Options</h4>
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Mark as Featured
                </span>
              </label>
              <div className="text-xs text-gray-500">
                <i className="fas fa-star text-yellow-500 mr-1"></i>
                Featured auctions appear prominently on the homepage and search results
              </div>
            </div>
          </div>

          {/* Image Management */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Images</h4>
            
            {/* Upload Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 5)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isUploading || uploadedImages.length >= 5}
                />
                {isUploading && (
                  <div className="flex items-center text-indigo-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Uploading...
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Max 5MB per image.
              </p>
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>
            
            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images ({uploadedImages.length}/5)
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {uploadedImages.map((image, index) => {
                    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${image.url}`;
                    console.log(`Rendering image ${index}:`, imageUrl);
                    
                    return (
                      <div key={index} className="relative group border rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={image.originalName}
                          width={120}
                          height={96}
                          className="block"
                          style={{ width: 120, height: 96, objectFit: 'cover' }}
                        />
                        {/* Remove button - positioned absolutely */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Remove image"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                        {/* Main image label */}
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
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

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : auction ? 'Update' : 'Create'} Auction
            </button>
          </div>
        </form>
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