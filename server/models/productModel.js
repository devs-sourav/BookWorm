// Alternative solution - Keep original language field, fix text indexing
const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      unique: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: [true, "Author is required"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    photos: [
      {
        type: String,
        required: [true, "Photo is required"],
        trim: true,
      },
    ],
    description: {
      type: String,
      required: [true, "Book description is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock number is required"],
      min: [0, "Stock cannot be negative"],
    },
    discountType: {
      type: String,
      enum: {
        values: ["none", "percent", "amount"],
        message: "{VALUE} is not supported, Enter a valid discount type",
      },
      default: "none",
    },
    discountValue: {
      type: Number,
      default: 0,
      min: [0, "Discount value cannot be negative"],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    saleNumber: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be negative"],
      max: [5, "Average rating cannot exceed 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },
    pageCount: {
      type: Number,
      min: [1, "Page count must be at least 1"],
    },
    // Keep original language field for display purposes
    language: {
      type: String,
      default: "English",
      trim: true,
    },
    // Add internal language code for MongoDB text search (optional)
    searchLanguage: {
      type: String,
      default: "none", // Use "none" to disable language-specific text processing
      enum: ["none", "en", "bn", "hi", "ur", "ar", "fr", "de", "es", "it", "pt", "ru", "zh", "ja", "ko"]
    },
    format: {
      type: String,
      enum: ["Hardcover", "Paperback", "eBook", "Audiobook"],
      default: "Paperback",
    },
    publicationYear: {
      type: Number,
      min: [1000, "Publication year must be valid"],
      max: [
        new Date().getFullYear() + 1,
        "Publication year cannot be in the future",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// All your existing virtuals and methods remain the same...
productSchema.virtual("starRating").get(function () {
  return Math.round(this.averageRating * 2) / 2;
});

productSchema.virtual("hasReviews").get(function () {
  return this.totalReviews > 0;
});

productSchema.virtual("ratingText").get(function () {
  if (this.totalReviews === 0) return "No reviews yet";
  if (this.totalReviews === 1) return "1 review";
  return `${this.totalReviews} reviews`;
});

productSchema.pre("validate", function (next) {
  if (this.isNew && (!this.photos || this.photos.length === 0)) {
    this.invalidate("photos", "At least one photo is required");
  }
  next();
});

productSchema.pre("save", async function (next) {
  try {
    if (this.isModified("title") || this.isNew) {
      let baseSlug = slugify(this.title, { lower: true });
      let uniqueSlug = baseSlug;
      let counter = 1;

      const query = this.isNew
        ? { slug: uniqueSlug }
        : { slug: uniqueSlug, _id: { $ne: this._id } };

      while (await this.constructor.findOne(query)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        query.slug = uniqueSlug;
        counter++;
      }

      this.slug = uniqueSlug;
    }

    if (this.discountType === "none") {
      this.salePrice = this.price;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// All your existing methods remain the same...
productSchema.methods.generateUniqueSlug = async function () {
  let baseSlug = slugify(this.title, { lower: true });
  let uniqueSlug = baseSlug;
  let counter = 1;

  const query = { slug: uniqueSlug, _id: { $ne: this._id } };

  while (await this.constructor.findOne(query)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    query.slug = uniqueSlug;
    counter++;
  }

  return uniqueSlug;
};

productSchema.statics.getHighRatedProducts = function (minRating = 4, limit = 10) {
  return this.find({
    averageRating: { $gte: minRating },
    totalReviews: { $gte: 5 },
    isActive: true,
  })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .populate("author", "name")
    .populate("category", "name");
};

productSchema.statics.getTrendingProducts = function (limit = 10) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.find({
    isActive: true,
    averageRating: { $gte: 3.5 },
    updatedAt: { $gte: thirtyDaysAgo },
  })
    .sort({ 
      averageRating: -1, 
      totalReviews: -1, 
      visitCount: -1 
    })
    .limit(limit)
    .populate("author", "name")
    .populate("category", "name");
};

// FIXED: Text index with language override disabled
productSchema.index({ title: "text", description: "text" }, {
  default_language: "none",
  language_override: "searchLanguage" // Use searchLanguage field instead of language
});

productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ author: 1 });
productSchema.index({ isbn: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ averageRating: -1, totalReviews: -1 });
productSchema.index({ language: 1 }); // Keep for filtering by display language

const Product = model("Product", productSchema);
module.exports = Product;