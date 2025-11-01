const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const subCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Sub-Category title is required"],
      trim: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required to create sub-category"],
    },
    brands: [
      {
        type: Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Simple pre-save middleware (only for create and save operations)
subCategorySchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, { lower: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for existing slugs (excluding current document)
    while (
      await this.constructor.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id },
      })
    ) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }
  next();
});

// Static method to generate available slug
subCategorySchema.statics.generateAvailableSlug = async function (
  title,
  excludeId = null
) {
  const baseSlug = slugify(title, { lower: true });
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    let query = { slug: uniqueSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.findOne(query);
    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
};

// Add indexes for better performance
subCategorySchema.index({ slug: 1 });
subCategorySchema.index({ category: 1 });

const SubCategory = model("SubCategory", subCategorySchema);
module.exports = SubCategory;
