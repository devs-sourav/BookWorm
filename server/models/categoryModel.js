const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Category title is required"],
      trim: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    slug: {
      type: String,
    },

    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    // Ensure title is properly trimmed
    this.title = this.title.trim();
    // Generate slug
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});
const Category = model("Category", categorySchema);
module.exports = Category;
