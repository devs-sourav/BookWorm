const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
    },

    subTitle: {
      type: String,
      required: [true, "Sub-title is required"],
    },

    photo: {
      type: String,
      required: [true, "Photo is required"],
    },

    link: {
      type: String,
      required: [true, "Link is required"],
      trim: true,
    },

    bannerType: {
      type: String,
      enum: {
        values: ["Main Banner", "Deals of the Week", "New Release", "top banner", "bottom banner"],
        message: "{VALUE} is not supported, Please provide valid banner type",
      },
      required: [true, "Banner type is required"],
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

const Banner = model("Banner", bannerSchema);
module.exports = Banner;
