import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProductItem from '../components/productitem/ProductItem';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="sr-only">Loading author details...</span>
  </div>
);

// Enhanced Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-16 px-4">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        aria-label="Retry loading author details"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try Again
      </button>
    )}
  </div>
);

// Enhanced Author Header Component
const AuthorHeader = ({ author }) => (
  <div className="bg-white shadow-sm rounded-xl p-6 mb-8 border border-gray-100">
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
      <div className="flex-shrink-0">
        <div className="relative group">
          <img
            src={author.photo || "/placeholder-image.jpg"}
            alt={`${author.name} - Author photo`}
            className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-gray-100 shadow-md transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
      
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {author.name}
        </h1>
        
        {author.bio && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {author.bio}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Member since {new Date(author.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          
          {author.updatedAt !== author.createdAt && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Updated {new Date(author.updatedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);



// Empty State Component
const EmptyState = ({ title, description, icon }) => (
  <div className="text-center py-20 px-4">
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">{description}</p>
  </div>
);

// Main AuthorDetailPage Component
const AuthorDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');

  const [author, setAuthor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced error messages
  const getErrorMessage = (error, status) => {
    if (status === 404) {
      return "The author you're looking for doesn't exist or has been removed.";
    }
    if (status === 500) {
      return "Our servers are experiencing issues. Please try again in a few moments.";
    }
    if (error.includes('Failed to fetch') || error.includes('NetworkError')) {
      return "Unable to connect to our servers. Please check your internet connection.";
    }
    return error || "An unexpected error occurred while loading the author's information.";
  };

  // Fetch author details with better error handling
  const fetchAuthorDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/author/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(getErrorMessage('HTTP error', response.status));
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data?.author) {
        setAuthor(data.data.author);
      } else {
        throw new Error('Author information is not available.');
      }
    } catch (err) {
      console.error('Error fetching author details:', err);
      throw err;
    }
  };

  // Fetch author's products with better error handling
  const fetchAuthorProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/product/author/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(getErrorMessage('HTTP error', response.status));
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data?.books) {
        setProducts(data.data.books);
        // Fallback author data if needed
        if (!author && data.data.author) {
          setAuthor(data.data.author);
        }
      } else {
        throw new Error('Unable to load books for this author.');
      }
    } catch (err) {
      console.error('Error fetching author products:', err);
      throw err;
    }
  };

  // Enhanced data fetching with retry logic
  const fetchData = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isRetry) {
        setRetryCount(prev => prev + 1);
        // Add small delay for retry to prevent spam
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await Promise.all([
        fetchAuthorDetails().catch(err => {
          console.warn('Author details failed:', err);
          return null; // Don't fail the entire request if author details fail
        }),
        fetchAuthorProducts()
      ]);
    } catch (err) {
      setError(getErrorMessage(err.message, null));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setError('Author ID is missing from the URL. Please check the link and try again.');
      setLoading(false);
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ErrorMessage 
            message={error} 
            onRetry={retryCount < 3 ? () => fetchData(true) : null} 
          />
        </div>
      </div>
    );
  }

  // Author not found state
  if (!author) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <EmptyState 
            title="Author not found"
            description="The author you're looking for doesn't exist or may have been removed from our catalog."
            icon="👤"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto ">
        {/* Author Header */}
        <AuthorHeader author={author} />

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Books by {author.name}
              </h2>
              <p className="text-gray-600">
                Discover the complete collection of works by this author
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium">
                {products.length} book{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState 
              title="No books available"
              description="This author hasn't published any books in our catalog yet. Check back later for new releases."
              icon="📚"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => {
                // Enhanced discount calculation
                let discount = 0;
                let priceAfterDiscount = product.salePrice || product.price;

                if (product.discountType === 'amount' && product.discountValue > 0) {
                  discount = product.discountValue;
                  priceAfterDiscount = Math.max(0, product.price - product.discountValue);
                } else if (product.discountType === 'percent' && product.discountValue > 0) {
                  discount = product.discountValue;
                  priceAfterDiscount = Math.max(0, product.price - (product.price * product.discountValue / 100));
                }

                return (
                  <ProductItem
                    key={product._id}
                    product={product}
                    id={product._id}
                    title={product.title}
                    subtitle={product.brand?.title || ''}
                    categoryName={product.category?.title || ''}
                    image={product.photos || []}
                    regularprice={product.price}
                    offerprice={product.salePrice}
                    priceAfterDiscount={priceAfterDiscount}
                    discount={discount}
                    discountType={product.discountType}
                    discountPercent={product.discountValue}
                    categoryId={product.category?._id}
                    brandId={product.brand?._id}
                    freeShipping={product.freeShipping}
                    classItem="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100 rounded-lg overflow-hidden"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorDetailPage;