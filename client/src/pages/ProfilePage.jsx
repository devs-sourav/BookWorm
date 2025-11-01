import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Shield, Camera, Edit2, Check, X, 
  AlertCircle, Loader, CheckCircle, Upload, Save, Lock,
  User2
} from 'lucide-react';
import UserOrdersPage from '../components/orders/UserOrdersPage';

// Enhanced Photo Cropper Component with bigger square and better preview
const PhotoCropper = ({ imageUrl, onCrop, onCancel, isLoading }) => {
  const [crop, setCrop] = useState({ x: 50, y: 50, width: 600, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [naturalImageSize, setNaturalImageSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      
      setImageSize({ width: rect.width, height: rect.height });
      setNaturalImageSize({ width: naturalWidth, height: naturalHeight });
      
      // Set larger initial crop to center (80% of smaller dimension)
      const minDimension = Math.min(rect.width, rect.height);
      const size = Math.min(600, minDimension * 0.8); // Larger crop area
      setCrop({
        x: (rect.width - size) / 2,
        y: (rect.height - size) / 2,
        width: size,
        height: size
      });
    }
  };

  // Update preview whenever crop changes
  useEffect(() => {
    updatePreview();
  }, [crop, imageSize]);

  const updatePreview = () => {
    const canvas = previewCanvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || imageSize.width === 0) return;

    const ctx = canvas.getContext('2d');
    const previewSize = 120; // Preview size
    canvas.width = previewSize;
    canvas.height = previewSize;

    // Calculate scale factors
    const scaleX = naturalImageSize.width / imageSize.width;
    const scaleY = naturalImageSize.height / imageSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, previewSize, previewSize);

    try {
      // Draw the cropped image preview
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        previewSize,
        previewSize
      );
    } catch (error) {
      console.warn('Preview update failed:', error);
    }
  };

  const getMousePosition = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    const pos = getMousePosition(e);
    setDragStart({ x: pos.x - crop.x, y: pos.y - crop.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragType) return;

    const pos = getMousePosition(e);
    
    if (dragType === 'move') {
      const newX = Math.max(0, Math.min(imageSize.width - crop.width, pos.x - dragStart.x));
      const newY = Math.max(0, Math.min(imageSize.height - crop.height, pos.y - dragStart.y));
      
      setCrop(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (dragType === 'resize') {
      const newWidth = Math.max(100, Math.min(imageSize.width - crop.x, pos.x - crop.x));
      const newHeight = newWidth; // Keep square aspect ratio
      
      // Ensure crop doesn't exceed image boundaries
      const maxWidth = imageSize.width - crop.x;
      const maxHeight = imageSize.height - crop.y;
      const finalSize = Math.min(newWidth, maxWidth, maxHeight);
      
      setCrop(prev => ({
        ...prev,
        width: finalSize,
        height: finalSize
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  const handleCropSave = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    const outputSize = 400; // Higher resolution output
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate scale factors
    const scaleX = naturalImageSize.width / imageSize.width;
    const scaleY = naturalImageSize.height / imageSize.height;

    // Clear canvas and draw the cropped image
    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.92);
  }, [crop, onCrop, imageSize, naturalImageSize]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Crop Your Photo</h3>
        <p className="text-sm text-gray-600 mb-6">Drag to move • Drag corner to resize • Larger crop area for better quality</p>
        
        <div 
          ref={containerRef}
          className="relative inline-block border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair mx-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ maxWidth: '90vw', maxHeight: '70vh' }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-96 object-contain select-none block mx-auto"
            onLoad={handleImageLoad}
            draggable={false}
          />
          
          {/* Crop overlay */}
          {imageSize.width > 0 && (
            <>
              {/* Dark overlay areas */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-60"
                style={{
                  clipPath: `polygon(
                    0% 0%, 
                    0% 100%, 
                    ${crop.x}px 100%, 
                    ${crop.x}px ${crop.y}px, 
                    ${crop.x + crop.width}px ${crop.y}px, 
                    ${crop.x + crop.width}px ${crop.y + crop.height}px, 
                    ${crop.x}px ${crop.y + crop.height}px, 
                    ${crop.x}px 100%, 
                    100% 100%, 
                    100% 0%
                  )`
                }}
              />
              
              {/* Crop selection box */}
              <div
                className="absolute border-2 border-white shadow-lg"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                  cursor: 'move'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white border-opacity-40" />
                  ))}
                </div>
                
                {/* Corner handle for resizing - bigger and more visible */}
                <div
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border-2 border-blue-500 cursor-se-resize rounded-full shadow-lg flex items-center justify-center"
                  onMouseDown={(e) => handleMouseDown(e, 'resize')}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                
                {/* Size indicator */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {Math.round(crop.width)} × {Math.round(crop.height)}
                </div>
              </div>
            </>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Enhanced Preview */}
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
        <div className="inline-block relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 shadow-lg">
            <canvas 
              ref={previewCanvasRef}
              className="w-full h-full object-cover"
              width="120"
              height="120"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">This is how your profile photo will appear</p>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          onClick={handleCropSave}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center transition-colors shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Save Photo
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const params = useParams();
  const id = params.id || params['*']?.split('/').pop() || Object.values(params).pop();
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Photo upload states
  const [showPhotoCropper, setShowPhotoCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = getAuthToken();
      
      if (!id || !token) {
        setError(`Missing ${!id ? 'user ID' : 'authentication token'}`);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/api/v1/auth/me/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          } else if (response.status === 404) {
            throw new Error('Profile not found.');
          } else {
            throw new Error(`Failed to load profile (${response.status})`);
          }
        }

        const data = await response.json();
        
        if (data.status === 'success' && data.data?.user) {
          const userData = data.data.user;
          setUser(userData);
          // Remove email from editedUser since it's no longer editable
          setEditedUser({ 
            name: userData.name || '',
            phone: userData.phone || ''
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        setError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateForm = () => {
    const errors = {};
    
    if (!editedUser.name?.trim()) {
      errors.name = 'Name is required';
    } else if (editedUser.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (editedUser.phone && !/^[+]?[\d\s\-()]+$/.test(editedUser.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Remove email from editedUser since it's no longer editable
    setEditedUser({ 
      name: user.name || '',
      phone: user.phone || ''
    });
    setFieldErrors({});
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      setUpdateLoading(true);
      setError(null);
      setFieldErrors({});
      
      console.log('Sending update request with data:', {
        name: editedUser.name.trim(),
        phone: editedUser.phone?.trim() || undefined
      });

      const response = await fetch(`http://localhost:8000/api/v1/auth/update-profile/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedUser.name.trim(),
          phone: editedUser.phone?.trim() || null
        })
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response format');
      }

      console.log('Parsed response:', data);

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          console.log('Validation errors:', data.errors);
          const backendErrors = {};
          data.errors.forEach(err => {
            if (err.path) backendErrors[err.path] = err.msg;
          });
          setFieldErrors(backendErrors);
          throw new Error('Please fix the validation errors');
        } else if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(data.message || `Update failed (${response.status})`);
        }
      }
      
      if (data.status === 'success' && data.data?.user) {
        const updatedUser = data.data.user;
        console.log('Profile updated successfully:', updatedUser);
        setUser(updatedUser);
        setEditedUser({
          name: updatedUser.name || '',
          phone: updatedUser.phone || ''
        });
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        console.error('Unexpected response format:', data);
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      name: user.name || '',
      phone: user.phone || ''
    });
    setFieldErrors({});
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // Increased to 10MB
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowPhotoCropper(true);
      setError(null); // Clear any existing errors
    };
    reader.onerror = () => {
      setError('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob) => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      setPhotoUploadLoading(true);
      setError(null);

      // Create FormData for photo upload
      const formData = new FormData();
      formData.append('photo', croppedBlob, 'profile-photo.jpg');

      console.log('Uploading photo for user:', id);

      // Upload photo using the correct update-profile endpoint
      const uploadResponse = await fetch(`http://localhost:8000/api/v1/auth/update-profile/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData
      });

      const responseText = await uploadResponse.text();
      console.log('Photo upload response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse upload response:', parseError);
        throw new Error('Invalid server response format');
      }

      if (!uploadResponse.ok) {
        console.error('Upload failed:', data);
        throw new Error(data.message || `Upload failed (${uploadResponse.status})`);
      }

      if (data.status === 'success' && data.data?.user) {
        console.log('Photo uploaded successfully');
        setUser(data.data.user);
        setSuccess('Profile photo updated successfully!');
        setShowPhotoCropper(false);
        setSelectedImage(null);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message || 'Failed to update profile photo');
      }

    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error.message || 'Failed to upload photo');
    } finally {
      setPhotoUploadLoading(false);
    }
  };

  const handleCropCancel = () => {
    setShowPhotoCropper(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">Loading Your Profile</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Error state (no user data)
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-xl text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Profile Not Found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container">
        
        {/* Photo Cropper Modal */}
        {showPhotoCropper && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <PhotoCropper
                imageUrl={selectedImage}
                onCrop={handleCropComplete}
                onCancel={handleCropCancel}
                isLoading={photoUploadLoading}
              />
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <span className="text-green-800 font-medium">{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="h-4 w-4 text-green-600" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-800 font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white shadow-lg rounded-xl mb-8 overflow-hidden">
          <div className="bg-white text-[#292929] px-8 py-8">
          {/* <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-8"> */}
            <div className="flex items-center space-x-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-white shadow-lg">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="h-full w-full flex items-center justify-center bg-blue-500 text-[#292929] text-xl font-bold" 
                    style={{ display: user.photo ? 'none' : 'flex' }}
                  >
                    {getInitials(user.name)}
                  </div>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploadLoading}
                  className="absolute -bottom-1 -right-1 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                >
                  {photoUploadLoading ? (
                    <Loader className="h-4 w-4 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>

              {/* User Info */}
              <div className="text-[#292929] flex-1">
                <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                <p className="text-[#292929] mb-2 capitalize">{user.role} Account</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-white/10 hover:bg-white/20 border border-gray-300 text-[#292929] px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-2 inline" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={updateLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center"
                  >
                    {updateLoading ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updateLoading}
                    className="bg-white/10 hover:bg-white/20 border border-gray-300 text-[#292929] px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    <X className="h-4 w-4 mr-2 inline" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-white border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h2>
              </div>
              
              <div className="px-6 py-6 space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editedUser.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 ">{user.name}</span>
                    </div>
                  )}
                </div>

                {/* Email Field - Non-editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700 flex-1">{user.email}</span>
                    {user.emailVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Email address cannot be changed for security reasons
                  </p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        value={editedUser.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number (optional)"
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 ">
                        {user.phone || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Details */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-white border-b">
                <h2 className="text-lg font-bold text-blue-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Account Details
                </h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    User ID
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User2 className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-gray-900  ">{user._id}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Account Type
                  </label>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-blue-900  capitalize">{user.role}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Member Since
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800 text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Email Status
                  </label>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    user.emailVerified ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      user.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
            <UserOrdersPage/>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;