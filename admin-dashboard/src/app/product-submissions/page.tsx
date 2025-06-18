'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface ProductSubmission {
  _id: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  city: string;
  productName: string;
  brand?: string;
  category: string;
  condition: string;
  expectedPrice: number;
  description: string;
  images: Array<{
    url: string;
    filename: string;
    originalName: string;
    size: number;
    order: number;
  }>;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_AUCTION';
  adminNotes?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
    username: string;
  };
  reviewedAt?: string;
  auctionId?: string;
  submittedAt: string;
  timeSinceSubmission: string;
}

interface StatusCounts {
  PENDING: number;
  UNDER_REVIEW: number;
  APPROVED: number;
  REJECTED: number;
  CONVERTED_TO_AUCTION: number;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    PENDING: 0,
    UNDER_REVIEW: 0,
    APPROVED: 0,
    REJECTED: 0,
    CONVERTED_TO_AUCTION: 0
  });
  const [selectedSubmission, setSelectedSubmission] = useState<ProductSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'review' | 'convert' | 'view'>('view');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Conversion form state
  const [conversionData, setConversionData] = useState({
    basePrice: '',
    bidIncrement: '10',
    entryFee: '',
    endTime: '',
    startTime: '',
    categoryId: ''
  });

  // Review form state
  const [reviewData, setReviewData] = useState({
    status: '',
    adminNotes: ''
  });

  useEffect(() => {
    loadSubmissions();
    loadCategories();
  }, [currentPage, filters]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProductSubmissions(
        currentPage,
        10,
        filters.search,
        filters.status
      );

      if (data.success) {
        setSubmissions(data.data.submissions);
        setStatusCounts(data.data.statusCounts);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Failed to load submissions');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      if (data.success) {
        setCategories(data.data.categories || data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: string, notes: string) => {
    try {
      setActionLoading(true);
      const data = await apiService.updateProductSubmissionStatus(submissionId, status, notes);

      if (data.success) {
        await loadSubmissions();
        setShowModal(false);
        setReviewData({ status: '', adminNotes: '' });
        alert('Submission status updated successfully!');
      } else {
        alert(`Failed to update status: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const convertToAuction = async (submissionId: string) => {
    try {
      setActionLoading(true);
      const data = await apiService.convertProductSubmissionToAuction(submissionId, conversionData);

      if (data.success) {
        await loadSubmissions();
        setShowModal(false);
        setConversionData({
          basePrice: '',
          bidIncrement: '10',
          entryFee: '',
          endTime: '',
          startTime: '',
          categoryId: ''
        });
        alert('Successfully converted to auction!');
      } else {
        alert(`Failed to convert: ${data.message}`);
      }
    } catch (error) {
      console.error('Error converting to auction:', error);
      alert('Network error converting to auction');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      const data = await apiService.deleteProductSubmission(submissionId);

      if (data.success) {
        await loadSubmissions();
        alert('Submission deleted successfully!');
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Network error deleting submission');
    }
  };

  const openModal = (submission: ProductSubmission, type: 'review' | 'convert' | 'view') => {
    setSelectedSubmission(submission);
    setModalType(type);
    setShowModal(true);

    if (type === 'convert') {
      setConversionData(prev => ({
        ...prev,
        basePrice: submission.expectedPrice.toString(),
        entryFee: (submission.expectedPrice * 0.1).toString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        startTime: new Date().toISOString().slice(0, 16)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CONVERTED_TO_AUCTION: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      PENDING: '⏳',
      UNDER_REVIEW: '👀',
      APPROVED: '✅',
      REJECTED: '❌',
      CONVERTED_TO_AUCTION: '🎪'
    };
    return icons[status] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Product Submissions</h1>
            <p className="mt-2 text-gray-600">Review and manage submitted products</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{getStatusIcon(status)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CONVERTED_TO_AUCTION">Converted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Product name, seller..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: '', category: '', search: '' });
                  setCurrentPage(1);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={`${process.env.NEXT_PUBLIC_API_URL}${submission.images[0]?.url}` || '/placeholder.jpg'}
                              alt={submission.productName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.brand && `${submission.brand} • `}{submission.condition}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{submission.sellerName}</div>
                        <div className="text-sm text-gray-500">{submission.sellerEmail}</div>
                        <div className="text-sm text-gray-500">{submission.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₨{submission.expectedPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.timeSinceSubmission}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(submission, 'view')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          {submission.status === 'PENDING' && (
                            <button
                              onClick={() => openModal(submission, 'review')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Review
                            </button>
                          )}
                          {/* Convert option commented out
                          {(submission.status === 'APPROVED' || submission.status === 'PENDING') && (
                            <button
                              onClick={() => openModal(submission, 'convert')}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Convert
                            </button>
                          )}
                          */}
                          <button
                            onClick={() => deleteSubmission(submission._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedSubmission && (
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
                        <i className={`fas ${modalType === 'view' ? 'fa-eye' : modalType === 'review' ? 'fa-clipboard-check' : 'fa-exchange-alt'} text-white text-lg`}></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold leading-6 text-white">
                        {modalType === 'view' && 'Submission Details'}
                        {modalType === 'review' && 'Review Submission'}
                        {modalType === 'convert' && 'Convert to Auction'}
                      </h3>
                      <p className="text-sm text-indigo-100">
                        {modalType === 'view' && 'View product submission details'}
                        {modalType === 'review' && 'Update status and add admin notes'}
                        {modalType === 'convert' && 'Convert this submission to an auction'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  >
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {modalType === 'view' && (
                  <div className="space-y-6 p-6 sm:p-8">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                          <i className="fas fa-box text-indigo-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Product Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Name:</span> {selectedSubmission.productName}</p>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Brand:</span> {selectedSubmission.brand || 'N/A'}</p>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Category:</span> {selectedSubmission.category}</p>
                        </div>
                        <div>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Condition:</span> {selectedSubmission.condition}</p>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Expected Price:</span> ₨{selectedSubmission.expectedPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                          <i className="fas fa-user text-purple-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Seller Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Name:</span> {selectedSubmission.sellerName}</p>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Email:</span> {selectedSubmission.sellerEmail}</p>
                        </div>
                        <div>
                          <p className="mb-2"><span className="font-semibold text-gray-700">Phone:</span> {selectedSubmission.sellerPhone}</p>
                          <p className="mb-2"><span className="font-semibold text-gray-700">City:</span> {selectedSubmission.city}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                          <i className="fas fa-align-left text-green-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Description</h4>
                      </div>
                      <p className="text-gray-600">{selectedSubmission.description}</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                          <i className="fas fa-images text-amber-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Images ({selectedSubmission.images.length})</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {selectedSubmission.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                          />
                        ))}
                      </div>
                    </div>

                    {selectedSubmission.adminNotes && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                        <div className="mb-4 flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <i className="fas fa-sticky-note text-blue-600"></i>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Admin Notes</h4>
                        </div>
                        <p className="text-gray-600">{selectedSubmission.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {modalType === 'review' && (
                  <div className="space-y-6 p-6 sm:p-8">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                          <i className="fas fa-tasks text-indigo-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Update Status</h4>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={reviewData.status}
                          onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Status</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                          <i className="fas fa-comment-alt text-purple-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Admin Notes</h4>
                      </div>
                      
                      <div>
                        <textarea
                          value={reviewData.adminNotes}
                          onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
                          rows={4}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Add notes about your review decision..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Convert to Auction - Commented out as requested */}
                {/*
                {modalType === 'convert' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₨)</label>
                        <input
                          type="number"
                          value={conversionData.basePrice}
                          onChange={(e) => setConversionData({ ...conversionData, basePrice: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bid Increment (₨)</label>
                        <input
                          type="number"
                          value={conversionData.bidIncrement}
                          onChange={(e) => setConversionData({ ...conversionData, bidIncrement: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee (₨)</label>
                        <input
                          type="number"
                          value={conversionData.entryFee}
                          onChange={(e) => setConversionData({ ...conversionData, entryFee: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={conversionData.categoryId}
                          onChange={(e) => setConversionData({ ...conversionData, categoryId: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <input
                          type="datetime-local"
                          value={conversionData.startTime}
                          onChange={(e) => setConversionData({ ...conversionData, startTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <input
                          type="datetime-local"
                          value={conversionData.endTime}
                          onChange={(e) => setConversionData({ ...conversionData, endTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
                */}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  
                  {modalType === 'review' && (
                    <button
                      onClick={() => updateSubmissionStatus(selectedSubmission._id, reviewData.status, reviewData.adminNotes)}
                      disabled={!reviewData.status || actionLoading}
                      className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {actionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Update Status
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Convert button commented out
                  {modalType === 'convert' && (
                    <button
                      onClick={() => convertToAuction(selectedSubmission._id)}
                      disabled={!conversionData.basePrice || !conversionData.endTime || !conversionData.categoryId || actionLoading}
                      className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {actionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Converting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-exchange-alt mr-2"></i>
                          Convert to Auction
                        </>
                      )}
                    </button>
                  )}
                  */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 