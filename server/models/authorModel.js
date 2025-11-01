const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const slugify = require("slugify"); // npm install slugify

const authorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      // unique removed from here
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Author photo is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Author bio is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enhanced pre-save middleware to generate unique slug from name
authorSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check if this is an update operation and the slug hasn't changed
    if (!this.isNew) {
      const existingDoc = await this.constructor.findById(this._id);
      if (existingDoc && existingDoc.slug === slug) {
        // Slug hasn't changed, no need to check for duplicates
        return next();
      }
    }

    // Keep checking until we find a unique slug
    while (true) {
      const existingAuthor = await this.constructor.findOne({
        slug: slug,
        _id: { $ne: this._id } // Fixed: was *id instead of _id
      });

      if (!existingAuthor) {
        // Slug is unique, we can use it
        break;
      }

      // Slug exists, try with a number suffix
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    this.slug = slug;
  }
  next();
});

// Add a static method to check slug availability
authorSchema.statics.isSlugAvailable = async function(name, excludeId = null) {
  const baseSlug = slugify(name, { lower: true, strict: true });
 
  let query = { slug: baseSlug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
 
  const existingAuthor = await this.findOne(query);
  return !existingAuthor;
};

// Add a static method to generate available slug
authorSchema.statics.generateAvailableSlug = async function(name, excludeId = null) {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = { slug: slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingAuthor = await this.findOne(query);
   
    if (!existingAuthor) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

const Author = model("Author", authorSchema);
module.exports = Author;