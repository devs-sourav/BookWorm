import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// AuthorCard Component
const AuthorCard = ({ author }) => {
  return (
    <div className="group relative rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-5">
      <Link
        to={`/author/${author._id}?slug=${author.slug}`}
        className="block"
        title={author.name}
      >
        <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
          <img
            src={author.photo}
            alt={author.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="text-center mt-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
            {author.name}
          </h3>
          {/* <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {author.bio}
          </p> */}
        </div>
      </Link>
    </div>
  );
};

// AuthorGrid Component
const AuthorGrid = ({ authors, gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" }) => {
  if (!authors || authors.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-medium mb-2">No authors found</h3>
        <p className="text-gray-400">No authors available for the selected filter</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {authors.map((author) => (
        <AuthorCard key={author._id} author={author} />
      ))}
    </div>
  );
};

// AuthorFilter Component
const AuthorFilter = ({ selectedLetter, onLetterSelect }) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const allOptions = ["ALL", "0-9", ...alphabet];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {allOptions.map((letter) => {
          const isActive =
            selectedLetter === letter ||
            (selectedLetter === null && letter === "ALL");
          return (
            <button
              key={letter}
              onClick={() => onLetterSelect(letter === "ALL" ? null : letter)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-16">
    <div className="text-red-500 text-xl mb-4">⚠️</div>
    <h3 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Main AuthorsPage Component
const AuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch authors from API
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://bookwormm.netlify.app/api/v1/author');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data && data.data.doc) {
        setAuthors(data.data.doc);
        setFilteredAuthors(data.data.doc);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch authors');
      console.error('Error fetching authors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter authors based on selected letter
  const filterAuthors = (letter) => {
    if (!letter) {
      setFilteredAuthors(authors);
      return;
    }

    const filtered = authors.filter((author) => {
      const firstChar = author.name[0].toUpperCase();
      if (letter === "0-9") {
        return /^[0-9]/.test(firstChar);
      }
      return firstChar === letter;
    });

    setFilteredAuthors(filtered);
  };

  // Handle letter selection
  const handleLetterSelect = (letter) => {
    setSelectedLetter(letter);
    filterAuthors(letter);
  };

  // Fetch authors on component mount
  useEffect(() => {
    fetchAuthors();
  }, []);

  // Re-filter when authors change
  useEffect(() => {
    filterAuthors(selectedLetter);
  }, [authors, selectedLetter]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Our Authors
        </h1>

        <AuthorFilter
          selectedLetter={selectedLetter}
          onLetterSelect={handleLetterSelect}
        />

        {loading && <LoadingSpinner />}

        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={fetchAuthors}
          />
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 text-center text-gray-600">
              {selectedLetter
                ? `Showing ${filteredAuthors.length} authors starting with "${selectedLetter}"`
                : `Showing all ${filteredAuthors.length} authors`}
            </div>

            <AuthorGrid
              authors={filteredAuthors}
              gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthorsPage;