'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError
} from '@/store/slices/categoriesSlice';
import { apiService } from '@/services/apiService';

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

interface CategoryModalProps {
  category: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryFormData) => void;
  formError: string | null;
}

function CategoryModal({ category, isOpen, onClose, onSave, formError }: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    slug: '',
    icon: 'fas fa-tag',
    isActive: true
  });

  // Available icons for categories
  const availableIcons = [
    'fas fa-laptop', 'fas fa-car', 'fas fa-tshirt', 'fas fa-home',
    'fas fa-football-ball', 'fas fa-palette', 'fas fa-book', 'fas fa-gem',
    'fas fa-mobile-alt', 'fas fa-camera', 'fas fa-music', 'fas fa-gamepad',
    'fas fa-bicycle', 'fas fa-couch', 'fas fa-tools', 'fas fa-tag'
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        slug: category.slug || '',
        icon: category.icon || 'fas fa-tag',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      // Reset form for new category
      setFormData({
        name: '',
        description: '',
        slug: '',
        icon: 'fas fa-tag',
        isActive: true
      });
    }
  }, [category, isOpen]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !category ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-3xl">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <i className="fas fa-tags text-white text-lg"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold leading-6 text-white">
                    {category ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <p className="text-sm text-indigo-100">
                    {category ? 'Update category details and settings' : 'Set up a new category for auctions'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Form Error Display */}
            {formError && (
              <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-red-700">
                      {formError}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="Enter category name..."
                        required
                        minLength={2}
                        maxLength={50}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.name.length}/50 characters
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                        placeholder="category-slug"
                        required
                        pattern="^[a-z0-9-]+$"
                        title="Only lowercase letters, numbers, and hyphens allowed"
                      />
                      {!category && (
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-generated from name. You can edit it manually.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      rows={3}
                      placeholder="Brief description of the category..."
                      maxLength={200}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/200 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Icon Selection */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <i className="fas fa-palette text-purple-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Icon Selection</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Selected icon:</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                        <i className={`${formData.icon} text-indigo-600`}></i>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formData.icon}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose an icon
                    </label>
                    <div className="grid grid-cols-8 gap-3 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-white">
                      {availableIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({...formData, icon})}
                          className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                            formData.icon === icon 
                              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          title={icon}
                        >
                          <i className={`${icon} text-lg ${
                            formData.icon === icon ? 'text-indigo-600' : 'text-gray-600'
                          }`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Status */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <i className="fas fa-toggle-on text-green-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Category Status</h4>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Active Category</span>
                      <p className="text-xs text-gray-600">
                        Active categories are available for use in auctions
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    <i className={`fas ${formData.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('form')?.requestSubmit();
                }}
                className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                <i className={`fas ${category ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                {category ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoriesTab() {
  const dispatch = useAppDispatch();
  const { categories, totalCategories, isLoading, error } = useAppSelector((state) => state.categories);

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryData: CategoryFormData) => {
    try {
      setFormError(null);
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory._id, categoryData })).unwrap();
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
      }
      setIsModalOpen(false);
    } catch (error: any) {
      // Handle validation errors from API
      setFormError(error);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" category? This action cannot be undone.`)) {
      dispatch(deleteCategory(id));
    }
  };

  const handleToggleStatus = async (category: any) => {
    try {
      await dispatch(updateCategory({ 
        id: category._id, 
        categoryData: { ...category, isActive: !category.isActive }
      })).unwrap();
      // Refresh categories to ensure filters work correctly
      dispatch(fetchCategories());
    } catch (error: any) {
      alert(`Failed to update category status: ${error}`);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    // Refresh data when filter changes to ensure proper filtering
    dispatch(fetchCategories());
  };

  const handleInitializeDefaults = async () => {
    if (window.confirm('This will create default categories for common auction items. Continue?')) {
      setIsInitializing(true);
      try {
        await apiService.initializeDefaultCategories();
        dispatch(fetchCategories()); // Refresh the categories list
      } catch (error) {
        console.error('Failed to initialize default categories:', error);
        alert('Failed to initialize default categories. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories Management</h2>
            <p className="text-gray-600">Organize and manage auction categories</p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Category
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-800 bg-red-50 hover:bg-red-100 font-medium rounded-lg text-xs px-3 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Categories
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, description, or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => dispatch(fetchCategories())}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Categories ({filteredCategories.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCategories.map((category) => (
              <div key={category._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                      <i className={`${category.icon} text-indigo-600 text-lg`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(category)}
                      className={`w-8 h-4 rounded-full transition-colors duration-200 ease-in-out ${
                        category.isActive ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                          category.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <i className="fas fa-box text-xs mr-1"></i>
                      {category.auctionCount || 0} auctions
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                      title="Edit category"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id, category.name)}
                      className="text-red-600 hover:text-red-900 text-sm"
                      title="Delete category"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-tags text-gray-300 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first category or initializing default categories.'}
            </p>
            {!searchTerm && !statusFilter && (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCreateCategory}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Category
                </button>
                <button
                  onClick={handleInitializeDefaults}
                  disabled={isInitializing}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInitializing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Initializing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Initialize Defaults
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        category={editingCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        formError={formError}
      />
    </div>
  );
} 