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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {category ? 'Edit Category' : 'Create New Category'}
        </h3>
        
        {/* Form Error Display */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="category-slug"
                required
              />
              {!category && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from name. You can edit it manually.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Brief description of the category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({...formData, icon})}
                    className={`p-2 rounded border text-center hover:bg-gray-50 ${
                      formData.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                    }`}
                  >
                    <i className={`${icon} text-lg`}></i>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-600 mr-2">Selected:</span>
                <i className={`${formData.icon} text-indigo-600 text-lg`}></i>
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {category ? 'Update' : 'Create'} Category
            </button>
          </div>
        </form>
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