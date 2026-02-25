import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Upload,
  X,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle,
  Calendar,
  Hash,
  Filter,
  Grid,
  List,
  Star,
  TrendingUp,
} from "lucide-react";

// API configuration
const API_BASE_URL = "https://bookworm-t3mi.onrender.com/api/v1/author";

// API service functions
const authorAPI = {
  getAllAuthors: async () => {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error("Failed to fetch authors");
    return response.json();
  },

  createAuthor: async (formData) => {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to create author`
      );
    }
    return response.json();
  },

  updateAuthor: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to update author`
      );
    }
    return response.json();
  },

  deleteAuthor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    // Handle different success scenarios
    if (response.ok) {
      // Try to parse JSON response, but don't fail if it's empty
      try {
        const data = await response.json();
        return data;
      } catch {
        // If no JSON response, return success object
        return { status: "success", message: "Author deleted successfully" };
      }
    } else {
      // Handle error responses
      let errorMessage = `HTTP ${response.status}: Failed to delete author`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If can't parse error JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  checkNameAvailability: async (name, excludeId = null) => {
    let url = `${API_BASE_URL}/check-name?name=${encodeURIComponent(name)}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to check name availability");
    return response.json();
  },
};

const AuthorManagement = () => {
  const [authors, setAuthors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    photo: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  // Load authors on component mount
  useEffect(() => {
    loadAuthors();
  }, []);

  // Auto-hide success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Local filtering only - no API calls
  const filteredAuthors = useMemo(() => {
    if (!searchTerm.trim()) {
      return authors;
    }
    const query = searchTerm.toLowerCase();
    return authors.filter(
      (author) =>
        author.name.toLowerCase().includes(query) ||
        author.bio.toLowerCase().includes(query)
    );
  }, [authors, searchTerm]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await authorAPI.getAllAuthors();

      if (response.status === "success") {
        const authorsData = response.data?.doc || [];
        setAuthors(authorsData);
      } else {
        throw new Error(response.message || "Failed to load authors");
      }
    } catch (err) {
      setError(
        "Unable to load authors. Please check your connection and try again."
      );
      console.error("Error loading authors:", err);
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  const checkNameAvailability = async (name) => {
    if (!name.trim() || name === selectedAuthor?.name) {
      return true;
    }

    try {
      const excludeId = modalMode === "edit" ? selectedAuthor._id : null;
      const response = await authorAPI.checkNameAvailability(name, excludeId);

      if (response.status === "success") {
        return response.data.isExactSlugAvailable;
      }
      return false;
    } catch (err) {
      console.error("Name check error:", err);
      return false;
    }
  };

  const openModal = (mode, author = null) => {
    setModalMode(mode);
    setSelectedAuthor(author);
    setShowModal(true);
    setFormErrors({});
    setError("");

    if (mode === "create") {
      setFormData({ name: "", bio: "", photo: null });
      setPhotoPreview("");
    } else if (mode === "edit" && author) {
      setFormData({
        name: author.name,
        bio: author.bio,
        photo: null,
      });
      setPhotoPreview(author.photo || "");
    } else if (mode === "view" && author) {
      setFormData({
        name: author.name,
        bio: author.bio,
        photo: null,
      });
      setPhotoPreview(author.photo || "");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAuthor(null);
    setFormData({ name: "", bio: "", photo: null });
    setFormErrors({});
    setPhotoPreview("");
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          photo: "File size must be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({
          ...prev,
          photo: "Please select an image file",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);

      if (formErrors.photo) {
        setFormErrors((prev) => ({
          ...prev,
          photo: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Author name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Author name must be at least 2 characters long";
    }

    if (!formData.bio.trim()) {
      errors.bio = "Author bio is required";
    } else if (formData.bio.trim().length < 10) {
      errors.bio = "Author bio must be at least 10 characters long";
    }

    if (modalMode === "create" && !formData.photo) {
      errors.photo = "Author photo is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");

      const isNameAvailable = await checkNameAvailability(formData.name.trim());
      if (!isNameAvailable) {
        setFormErrors((prev) => ({
          ...prev,
          name: "An author with this name already exists. Please enter a unique name.",
        }));
        setSubmitting(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("bio", formData.bio.trim());
      if (formData.photo) {
        submitData.append("photo", formData.photo);
      }

      let response;
      if (modalMode === "create") {
        response = await authorAPI.createAuthor(submitData);
      } else {
        response = await authorAPI.updateAuthor(selectedAuthor._id, submitData);
      }

      if (response.status === "success") {
        await loadAuthors();
        setSuccessMessage(
          `Author ${
            modalMode === "create" ? "created" : "updated"
          } successfully!`
        );
        closeModal();
      } else {
        throw new Error(response.message || `Failed to ${modalMode} author`);
      }
    } catch (err) {
      setError(
        err.message || `Failed to ${modalMode} author. Please try again.`
      );
      console.error(`${modalMode} error:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (author) => {
    try {
      setDeletingId(author._id);
      setError("");

      const response = await authorAPI.deleteAuthor(author._id);

      // More flexible success checking
      const isSuccess =
        response.status === "success" ||
        response.message?.includes("deleted") ||
        response.success === true ||
        !response.error; // If no error property, assume success

      if (isSuccess) {
        // Remove the deleted author from the local state immediately
        setAuthors((prev) => prev.filter((a) => a._id !== author._id));
        setSuccessMessage(`Author "${author.name}" deleted successfully!`);
        setDeleteConfirm(null);
      } else {
        throw new Error(
          response.message || response.error || "Failed to delete author"
        );
      }
    } catch (err) {
      setError(err.message || "Failed to delete author. Please try again.");
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen  from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Tailwind */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-90 shadow-2xl transform rotate-1"></div>
          <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Author Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Create and manage your author profiles
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {authors.length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {authors.length === 1 ? "Author" : "Authors"}
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Control Panel */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Search authors by name or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border-0 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm ring-1 ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Enhanced Add Button */}
            <button
              onClick={() => openModal("create")}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add New Author
              </div>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center shadow-lg animate-in slide-in-from-top-2 duration-500">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-800 font-medium flex-1">
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage("")}
              className="p-1 hover:bg-green-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center shadow-lg animate-in slide-in-from-top-2 duration-500">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-red-800 font-medium flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              className="p-1 hover:bg-red-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20"></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Authors
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch your authors...
              </p>
            </div>
          </div>
        ) : filteredAuthors.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0   rounded-full opacity-50"></div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? "No Authors Found" : "No Authors Yet"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {searchTerm
                ? `No authors match your search for "${searchTerm}". Try adjusting your search terms.`
                : "Start building your author collection by adding your first author profile."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal("create")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Create Your First Author
              </button>
            )}
          </div>
        ) : (
          /* Authors Display */
          <div className="space-y-8">
            {viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuthors.map((author, index) => (
                  <div
                    key={author._id}
                    className="group relative  rounded-md shadow-lg hover:shadow-2xl border border-white/20 overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      {author.photo ? (
                        <img
                          src={author.photo}
                          alt={author.name}
                          className="w-full h-full object-cover  group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full  from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                          <User className="w-16 h-16 text-white/80" />
                        </div>
                      )}

                      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div> */}

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => openModal("view", author)}
                          className="p-2.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="View author details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", author)}
                          className="p-2.5 bg-white/90 backdrop-blur-sm text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="Edit author"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(author)}
                          disabled={deletingId === author._id}
                          className="p-2.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                          title="Delete author"
                        >
                          {deletingId === author._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Author Name Overlay */}
                      <div className=" p-4"></div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <h3 className="!text-white font-bold text-lg leading-tight drop-shadow-lg mb-2">
                        {author.name || "Unnamed Author"}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {author.bio || "No biography available."}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Hash className="w-3 h-3 mr-1" />
                          <span className="font-medium truncate max-w-16">
                            {author.slug || "no-slug"}
                          </span>
                        </div>
                        {author.createdAt && (
                          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                            <span className="text-blue-600 font-medium">
                              {new Date(author.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredAuthors.map((author, index) => (
                  <div
                    key={author._id}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-white/20 p-6 flex items-center space-x-6 transform hover:-translate-y-0.5 transition-all duration-300"
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {author.photo ? (
                        <img
                          src={author.photo}
                          alt={author.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-md">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {author.name || "Unnamed Author"}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-2">
                        {author.bio || "No biography available."}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Hash className="w-3 h-3 mr-1" />
                          <span>{author.slug || "no-slug"}</span>
                        </div>
                        {author.createdAt && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              {new Date(author.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openModal("view", author)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("edit", author)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(author)}
                        disabled={deletingId === author._id}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {deletingId === author._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Results Summary */}
            <div className="flex items-center justify-center pt-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 shadow-sm">
                <p className="text-sm text-gray-600 text-center">
                  Showing{" "}
                  <span className="font-bold text-blue-600">
                    {filteredAuthors.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-blue-600">
                    {authors.length}
                  </span>{" "}
                  authors
                  {searchTerm && (
                    <span className="ml-2 text-purple-600 font-semibold">
                      matching "{searchTerm}"
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Beautiful Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-5 rounded-t-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    {modalMode === "create" ? (
                      <Plus className="w-5 h-5 text-white" />
                    ) : modalMode === "edit" ? (
                      <Edit className="w-5 h-5 text-white" />
                    ) : (
                      <Eye className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {modalMode === "create"
                        ? "Create New Author"
                        : modalMode === "edit"
                        ? "Edit Author"
                        : "Author Details"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {modalMode === "create"
                        ? "Add a new author to your collection"
                        : modalMode === "edit"
                        ? "Update author information"
                        : "View author details"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Photo Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                  Author Photo{" "}
                  {modalMode !== "view" && modalMode === "create" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                {photoPreview ? (
                  <div className="relative inline-block">
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    {modalMode !== "view" && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview("");
                          setFormData((prev) => ({ ...prev, photo: null }));
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  modalMode !== "view" && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <p className="mb-2 text-sm text-gray-700 font-semibold">
                            <span className="text-blue-600">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )
                )}

                {formErrors.photo && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      {formErrors.photo}
                    </span>
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900">
                  Author Name{" "}
                  {modalMode !== "view" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) {
                      setFormErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  disabled={modalMode === "view"}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    formErrors.name
                      ? "border-red-500 bg-red-50"
                      : modalMode === "view"
                      ? "border-gray-200 bg-gray-50 text-gray-700"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                  placeholder="Enter author's full name"
                />
                {formErrors.name && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      {formErrors.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900">
                  Biography{" "}
                  {modalMode !== "view" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, bio: e.target.value }));
                    if (formErrors.bio) {
                      setFormErrors((prev) => ({ ...prev, bio: "" }));
                    }
                  }}
                  disabled={modalMode === "view"}
                  rows="5"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                    formErrors.bio
                      ? "border-red-500 bg-red-50"
                      : modalMode === "view"
                      ? "border-gray-200 bg-gray-50 text-gray-700"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                  placeholder="Tell us about this author's background, achievements, and expertise..."
                />
                {formErrors.bio && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      {formErrors.bio}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional Info for View Mode */}
              {modalMode === "view" && selectedAuthor && (
                <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                    System Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAuthor.slug && (
                      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                        <div className="text-xs text-gray-500 font-medium mb-1">
                          URL Slug
                        </div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          <Hash className="w-3 h-3 mr-1 text-blue-500" />
                          {selectedAuthor.slug}
                        </div>
                      </div>
                    )}
                    {selectedAuthor.createdAt && (
                      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                        <div className="text-xs text-gray-500 font-medium mb-1">
                          Created On
                        </div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-green-500" />
                          {new Date(
                            selectedAuthor.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    )}
                    {selectedAuthor.updatedAt && (
                      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-white/20 md:col-span-2">
                        <div className="text-xs text-gray-500 font-medium mb-1">
                          Last Updated
                        </div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                          {new Date(
                            selectedAuthor.updatedAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>

                {modalMode !== "view" && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center min-w-[160px] justify-center shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {modalMode === "create" ? "Creating..." : "Updating..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {modalMode === "create"
                          ? "Create Author"
                          : "Update Author"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
            <div className="p-6">
              {/* Warning Header */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mr-4 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Delete Author
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Warning Content */}
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <p className="text-gray-800 mb-2">
                  Are you sure you want to permanently delete
                </p>
                <div className="flex items-center p-2 bg-white/50 rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-red-800">
                    "{deleteConfirm.name}"
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  All associated data will be permanently removed from the
                  system.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingId === deleteConfirm._id}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Keep Author
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deletingId === deleteConfirm._id}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                >
                  {deletingId === deleteConfirm._id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorManagement;
