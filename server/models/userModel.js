const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please prodive your email address"],
      validate: [validator.isEmail, "Please provide a valid email address"],
      lowercase: true,
      unique: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return validator.isMobilePhone(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "aklogicAdmin"],
        message: "{VALUE} is not supported",
      },
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      validate: {
        validator: function (val) {
          return /^\S*$/.test(val);
        },
        message: "Space is not allowed in password",
      },
      minLength: [8, "Minimum password length is 8 character"],
      maxLength: [25, "Maximum password length is 25 character"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm your password please"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Password does not matched",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// DOCUMENT MIDDLEWARES:
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARES:
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS:
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTIssuedTime) {
  if (this.passwordChangedAt) {
    const passwordChangeTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTIssuedTime < passwordChangeTime;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken; // Return the unhashed token
};

// Email verification token method
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  
  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken; // Return the unhashed token
};

const User = model("User", userSchema);
module.exports = User;