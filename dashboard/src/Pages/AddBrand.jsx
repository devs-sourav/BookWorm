import React, { useState, useEffect } from 'react';
import { Plus, Upload, X, Check, AlertCircle, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';

const BrandManagement = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, brandId: null, brandName: '' });

  // Form states
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subCategory: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Fetch all brands
  const fetchBrands = async () => {
    setBrandsLoading(true);
    try {
      const response = await fetch('https://bookwormm.netlify.app/api/v1/brand');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.doc) {
          setBrands(result.data.doc);
        } else {
          setBrands([]);
          showNotification('error', 'No brands found');
        }
      } else {
        showNotification('error', 'Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      showNotification('error', 'Error fetching brands');
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('https://bookwormm.netlify.app/api/v1/category');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.doc) {
          setCategories(result.data.doc);
        } else {
          setCategories([]);
          showNotification('error', 'No categories found');
        }
      } else {
        showNotification('error', 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('error', 'Error fetching categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Delete brand function
  const deleteBrand = async (brandId) => {
    try {
      const response = await fetch(`https://bookwormm.netlify.app/api/v1/brand/${brandId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'Publisher deleted successfully!');
        fetchBrands(); // Refresh the brands list
        setDeleteConfirm({ show: false, brandId: null, brandName: '' });
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: 'Failed to delete publisher' 
        }));
        showNotification('error', errorData.message || 'Failed to delete publisher');
      }
    } catch (error) {
      console.error('Error deleting publisher:', error);
      showNotification('error', 'Network error. Please check your connection and try again.');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (brand) => {
    setDeleteConfirm({ show: true, brandId: brand._id, brandName: brand.title });
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, brandId: null, brandName: '' });
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.title : 'Unknown';
  };

  // Get subcategory name by ID
  const getSubCategoryName = (categoryId, subCategoryId) => {
    if (!subCategoryId) return '-';
    const category = categories.find(cat => cat._id === categoryId);
    if (category && category.subCategories) {
      const subCategory = category.subCategories.find(sub => sub._id === subCategoryId);
      return subCategory ? subCategory.slug : 'Unknown';
    }
    return 'Unknown';
  };

  // Filter brands based on search and filters
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || brand.category === filterCategory;
    const matchesStatus = filterStatus === '' || 
                         (filterStatus === 'active' && brand.isActive) ||
                         (filterStatus === 'inactive' && !brand.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));
    
    const category = categories.find(cat => cat._id === categoryId);
    if (category && category.subCategories && category.subCategories.length > 0) {
      setSubCategories(category.subCategories);
    } else {
      setSubCategories([]);
    }
    
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle file selection
  const handleFileChange = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select an image file (PNG, JPG, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Publisher name is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Name must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Name must be less than 100 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('category', formData.category);
      
      if (formData.subCategory) {
        submitData.append('subCategory', formData.subCategory);
      }
      
      submitData.append('isActive', formData.isActive.toString());
      
      if (selectedFile) {
        submitData.append('photo', selectedFile);
      }

      const url = editingBrand 
        ? `https://bookwormm.netlify.app/api/v1/brand/${editingBrand._id}`
        : 'https://bookwormm.netlify.app/api/v1/brand';
      
      const method = editingBrand ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: submitData,
      });

      if (response.ok) {
        showNotification('success', `Publisher ${editingBrand ? 'updated' : 'created'} successfully!`);
        handleReset();
        fetchBrands(); // Refresh the brands list
        if (editingBrand) {
          setActiveTab('list');
        }
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: `Failed to ${editingBrand ? 'update' : 'create'} publisher` 
        }));
        showNotification('error', errorData.message || `Failed to ${editingBrand ? 'update' : 'create'} publisher`);
      }
    } catch (error) {
      console.error(`Error ${editingBrand ? 'updating' : 'creating'} publisher:`, error);
      showNotification('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      title: '',
      category: '',
      subCategory: '',
      isActive: true
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setSelectedCategory('');
    setSubCategories([]);
    setErrors({});
    setEditingBrand(null);
  };

  // Handle edit brand
  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      title: brand.title,
      category: brand.category,
      subCategory: brand.subCategory || '',
      isActive: brand.isActive
    });
    setSelectedCategory(brand.category);
    
    // Set subcategories for the selected category
    const category = categories.find(cat => cat._id === brand.category);
    if (category && category.subCategories) {
      setSubCategories(category.subCategories);
    }
    
    // Set preview image if exists
    if (brand.photo) {
      setPreviewImage(brand.photo);
    }
    
    setActiveTab('add');
  };

  // Remove uploaded file
  const removeFile = () => {
    setSelectedFile(null);
    setPreviewImage(editingBrand ? null : null);
    if (!editingBrand) {
      setPreviewImage(null);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === 'add' && activeTab === 'list') {
      handleReset();
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Publisher</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "<strong>{deleteConfirm.brandName}</strong>"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBrand(deleteConfirm.brandId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Tabs */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="text-3xl font-bold !text-white mb-8">Publisher Management</div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange('list')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'list'
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View Publishers
              </button>
              <button
                onClick={() => handleTabChange('add')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'add'
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-blue-600'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                {editingBrand ? 'Edit Publisher' : 'Add Publisher'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'list' ? (
              // Brands List View
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search publishers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('');
                      setFilterStatus('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>

                {/* Brands Table */}
                {brandsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading publishers...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Photo</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Publisher</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Subcategory</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Products</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBrands.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                              No publishers found
                            </td>
                          </tr>
                        ) : (
                          filteredBrands.map(brand => (
                            <tr key={brand._id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-3">
                                {brand.photo ? (
                                  <img
                                    src={brand.photo}
                                    alt={brand.title}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No Image</span>
                                  </div>
                                )}
                              </td>
                              <td className="border border-gray-200 px-4 py-3 font-medium">{brand.title}</td>
                              <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{brand.slug}</td>
                              <td className="border border-gray-200 px-4 py-3 text-sm">{getCategoryName(brand.category)}</td>
                              <td className="border border-gray-200 px-4 py-3 text-sm">{getSubCategoryName(brand.category, brand.subCategory)}</td>
                              <td className="border border-gray-200 px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  brand.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {brand.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-4 py-3 text-sm text-center">{brand.products.length}</td>
                              <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                                {new Date(brand.createdAt).toLocaleDateString()}
                              </td>
                              <td className="border border-gray-200 px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEdit(brand)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                    title="Edit publisher"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteConfirm(brand)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                    title="Delete publisher"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary */}
                <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t">
                  <span>
                    Showing {filteredBrands.length} of {brands.length} publishers
                  </span>
                  <span>
                    Active: {brands.filter(b => b.isActive).length} | 
                    Inactive: {brands.filter(b => !b.isActive).length}
                  </span>
                </div>
              </div>
            ) : (
              // Add/Edit Brand Form
              categoriesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading categories...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {editingBrand && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-medium">
                        Editing Publisher: {editingBrand.title}
                      </p>
                      <button
                        onClick={handleReset}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                      >
                        Cancel editing
                      </button>
                    </div>
                  )}

                  {/* Brand Title and Category Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Brand Title */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Publisher Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter publisher name"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                          errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        maxLength={100}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                          errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subcategory and Status Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Subcategory */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Subcategory
                        <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                      </label>
                      <select
                        value={formData.subCategory}
                        onChange={(e) => handleInputChange('subCategory', e.target.value)}
                        disabled={!selectedCategory || subCategories.length === 0}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                      >
                        <option value="">Select a subcategory</option>
                        {subCategories.map(subCategory => (
                          <option key={subCategory._id} value={subCategory._id}>
                            {subCategory.slug}
                          </option>
                        ))}
                      </select>
                      {!selectedCategory && (
                        <p className="text-xs text-gray-500">Select a category first</p>
                      )}
                      {selectedCategory && subCategories.length === 0 && (
                        <p className="text-xs text-gray-500">No subcategories available</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Status</label>
                      <div className="flex items-center space-x-6 pt-1">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="isActive"
                            checked={formData.isActive === true}
                            onChange={() => handleInputChange('isActive', true)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            Active
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="isActive"
                            checked={formData.isActive === false}
                            onChange={() => handleInputChange('isActive', false)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            Inactive
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Publisher Photo
                      <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                    </label>
                    
                    {previewImage ? (
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="Publisher preview"
                          className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">{selectedFile?.name || (editingBrand ? 'Current Image' : '')}</p>
                          {selectedFile && <p className="text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                          isDragOver
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                      >
                        <input
                          id="file-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          className="hidden"
                        />
                        <div className="space-y-4">
                          <Upload className={`mx-auto h-16 w-16 ${isDragOver ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                          <div>
                            <p className="text-lg font-medium text-gray-700">
                              {isDragOver ? 'Drop your image here' : 'Upload publisher photo'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Click to browse or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Supports: PNG, JPG, GIF (Max: 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          {editingBrand ? 'Updating Publisher...' : 'Creating Publisher...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {editingBrand ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Update Publisher
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5 mr-2" />
                              Create Publisher
                            </>
                          )}
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="flex-1 sm:flex-none px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                    >
                      {editingBrand ? 'Cancel Edit' : 'Reset Form'}
                    </button>

                    {editingBrand && (
                      <button
                        type="button"
                        onClick={() => {
                          handleReset();
                          setActiveTab('list');
                        }}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-8 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                      >
                        Back to List
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandManagement;