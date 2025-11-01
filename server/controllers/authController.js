const crypto = require("crypto");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const Email = require("../utils/Email");
const catchAsync = require("../utils/catchAsync");

// Helper function to filter allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// ====================== MULTER CONFIGURATION ======================

// Multer memory storage for file processing
const multerStorage = multer.memoryStorage();

// Multer file filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Export multer middleware for routes
exports.uploadUserPhoto = upload.single("photo");

// Resize user photo middleware
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Generate unique filename
  const filename = `user-${
    req.params.userId || req.user?.id || Date.now()
  }-${Date.now()}.jpeg`;
  req.file.filename = filename;

  // Ensure upload directory exists
  const uploadDir = path.join(__dirname, "../uploads/users");
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Process and save image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadDir, filename));

  next();
});

// Delete old photo helper function
const deleteOldPhoto = async (photoPath) => {
  if (!photoPath || photoPath === "default.jpg") return;

  try {
    const fullPath = path.join(__dirname, "../uploads/users", photoPath);
    await fs.unlink(fullPath);
  } catch (err) {
    console.log("Could not delete old photo:", err.message);
  }
};

// ====================== AUTH CONTROLLERS ======================

exports.signupController = catchAsync(async (req, res, next) => {
  // Filter body to only allow specific fields
  const filteredBody = filterObj(req.body, 'name', 'email', 'password', 'confirmPassword', 'phone');
  
  const user = await User.create(filteredBody);

  // Generate email verification token BEFORE setting password to undefined
  const emailVerificationToken = user.createEmailVerificationToken();

  // Save the verification token (password is already hashed from User.create)
  await user.save({ validateBeforeSave: false });

  // NOW set password to undefined for response (don't save again)
  user.password = undefined;

  try {
    // Use frontend URL for email verification link
    const url = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${emailVerificationToken}`;
    await new Email(user, url).sendWelcome();

    res.status(201).json({
      status: "success",
      message:
        "Signup completed successfully. Please check your email to verify your account.",
      data: {
        user,
      },
    });
  } catch (err) {
    // If email fails, clean up the verification token
    await User.findByIdAndUpdate(user._id, {
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpires: 1,
      },
    });

    return next(
      new AppError(
        "There was an error sending the verification email. Please try again later!",
        500
      )
    );
  }
});

exports.loginController = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password +active");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if account is active
  if (user.active === false) {
    return next(
      new AppError(
        "Your account has been deactivated. Please contact support or reactivate your account.",
        401
      )
    );
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return next(
      new AppError(
        "Please verify your email address before logging in. Check your inbox for verification link.",
        401
      )
    );
  }

  user.password = undefined;
  user.active = undefined;

  res.status(200).json({
    status: "success",
    message: "You are logged in successfully",
    data: {
      user,
    },
  });
});

exports.verifyEmailController = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Verification token is required!", 400));
  }

  // Hash the token to compare with stored hashed token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with matching token and check if token hasn't expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired!", 400));
  }

  // Verify the user's email using findByIdAndUpdate to avoid middleware issues
  await User.findByIdAndUpdate(user._id, {
    emailVerified: true,
    $unset: {
      emailVerificationToken: 1,
      emailVerificationExpires: 1,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully! You can now log in.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
    },
  });
});

exports.resendVerificationEmailController = catchAsync(
  async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required!", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("No user found with that email address!", 404));
    }

    if (user.emailVerified) {
      return next(new AppError("Email is already verified!", 400));
    }

    // Generate new verification token
    const emailVerificationToken = user.createEmailVerificationToken();

    // Update only the verification fields
    await User.findByIdAndUpdate(user._id, {
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpires: user.emailVerificationExpires,
    });

    try {
      const url = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${emailVerificationToken}`;
      await new Email(user, url).sendWelcome();

      res.status(200).json({
        status: "success",
        message:
          "Verification email resent successfully. Please check your inbox.",
      });
    } catch (err) {
      // Clean up verification token on email failure
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1,
        },
      });

      return next(
        new AppError(
          "There was an error sending the verification email. Please try again later!",
          500
        )
      );
    }
  }
);

exports.forgotPasswordController = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Email is required!", 400));

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with that email address!", 404));
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return next(
      new AppError(
        "Please verify your email address first before requesting password reset.",
        400
      )
    );
  }

  const resetToken = user.createPasswordResetToken();

  // Update only the password reset fields
  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: user.passwordResetToken,
    passwordResetExpires: user.passwordResetExpires,
  });

  try {
    // Use frontend URL for password reset link
    const resetURL = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Password reset email sent, Check your inbox please.",
    });
  } catch (err) {
    // Clean up password reset fields on email failure
    await User.findByIdAndUpdate(user._id, {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1,
      },
    });

    return next(
      new AppError(
        "There was an error sending the email, Try again later!",
        500
      )
    );
  }
});

exports.resetPasswordController = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (!password || !confirmPassword) {
    return next(new AppError("Password and confirm password are required!", 400));
  }

  // Hash the token to compare with stored hashed token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user based on hashed token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired!", 400));

  // Set new password and clear reset token fields
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password has been updated successfully",
  });
});

// ====================== PROFILE MANAGEMENT CONTROLLERS ======================

// Get current user profile
exports.getMeController = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Update user profile (non-sensitive data) with photo upload
exports.updateProfileController = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Create error if user POSTs password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /update-password.",
        400
      )
    );
  }

  // Get existing user data
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    // Clean up uploaded file if user not found
    if (req.file) {
      try {
        const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
        await fs.unlink(filePath);
      } catch (error) {
        console.log("Error deleting file after failed user lookup:", error.message);
      }
    }
    return next(new AppError("User not found!", 404));
  }

  // Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email", "phone");
  let oldPhotoPath = null;

  // Handle photo upload (similar to author controller)
  if (req.file) {
    console.log("New file uploaded:", req.file.filename);
    
    // Store old photo path for deletion AFTER successful update
    if (existingUser.photo && existingUser.photo !== "default.jpg") {
      oldPhotoPath = path.join(__dirname, "..", "uploads", "users", existingUser.photo);
      console.log("Old photo path stored for deletion:", oldPhotoPath);
    }
    
    // Set new photo URL (consistent with author controller pattern)
    filteredBody.photo = `${req.protocol}://${req.get("host")}/uploads/users/${req.file.filename}`;
    console.log("New photo URL:", filteredBody.photo);
  }

  // Check if there's anything to update
  if (Object.keys(filteredBody).length === 0) {
    // Clean up uploaded file if nothing to update
    if (req.file) {
      try {
        const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
        await fs.unlink(filePath);
      } catch (error) {
        console.log("Error deleting file after no updates:", error.message);
      }
    }
    return next(new AppError("No valid fields provided for update!", 400));
  }

  // If email is being updated, handle email verification
  let emailVerificationToken;
  if (filteredBody.email && filteredBody.email !== existingUser.email) {
    // Check if new email already exists
    const emailExists = await User.findOne({
      email: filteredBody.email,
      _id: { $ne: userId },
    });

    if (emailExists) {
      // Clean up uploaded file
      if (req.file) {
        try {
          const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
          await fs.unlink(filePath);
        } catch (error) {
          console.log("Error deleting file after email exists:", error.message);
        }
      }
      return next(
        new AppError("Email already in use by another account!", 400)
      );
    }

    // Generate email verification token for new email
    const tempUser = new User();
    emailVerificationToken = tempUser.createEmailVerificationToken();

    // Set email as unverified and add verification fields
    filteredBody.emailVerified = false;
    filteredBody.emailVerificationToken = tempUser.emailVerificationToken;
    filteredBody.emailVerificationExpires = tempUser.emailVerificationExpires;
  }

  try {
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      // Clean up uploaded file
      if (req.file) {
        try {
          const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
          await fs.unlink(filePath);
        } catch (error) {
          console.log("Error deleting file after failed update:", error.message);
        }
      }
      return next(new AppError("User not found!", 404));
    }

    // Only delete old photo AFTER successful database update
    if (oldPhotoPath && req.file) {
      try {
        await fs.unlink(oldPhotoPath);
        console.log("Old photo deleted successfully");
      } catch (error) {
        console.log("Error deleting old photo:", error.message);
        // Don't fail the request if old photo deletion fails
      }
    }

    // If email was updated, send verification email
    if (emailVerificationToken) {
      try {
        const url = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${emailVerificationToken}`;
        await new Email(updatedUser, url).sendEmailUpdate();

        res.status(200).json({
          status: "success",
          message:
            "Profile updated successfully. Please verify your new email address.",
          data: {
            user: updatedUser,
          },
        });
      } catch (err) {
        // If email fails, revert email changes but keep photo update
        await User.findByIdAndUpdate(userId, {
          email: existingUser.email,
          emailVerified: true,
          $unset: {
            emailVerificationToken: 1,
            emailVerificationExpires: 1,
          },
        });

        return next(
          new AppError(
            "Profile updated but there was an error sending verification email. Please try updating email again.",
            500
          )
        );
      }
    } else {
      res.status(200).json({
        status: "success",
        message: "Profile updated successfully!",
        data: {
          user: updatedUser,
        },
      });
    }
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
        await fs.unlink(filePath);
        console.log("New file deleted after failed update");
      } catch (deleteError) {
        console.log("Error deleting new file after failed update:", deleteError.message);
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join('. '), 400));
    }

    // Handle any other errors
    return next(error);
  }
});

// Update user photo only
exports.updateUserPhotoController = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!req.file) {
    return next(new AppError("User photo is required", 400));
  }

  // Get existing user
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    // Clean up uploaded file
    if (req.file) {
      try {
        const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
        await fs.unlink(filePath);
      } catch (error) {
        console.log("Error deleting file after failed user lookup:", error.message);
      }
    }
    return next(new AppError("User not found!", 404));
  }

  let oldPhotoPath = null;

  // Store old photo path for deletion AFTER successful update
  if (existingUser.photo && existingUser.photo !== "default.jpg") {
    // Extract filename from URL if it's a full URL
    const fileName = existingUser.photo.includes('/') 
      ? existingUser.photo.split("/").pop()
      : existingUser.photo;
    oldPhotoPath = path.join(__dirname, "..", "uploads", "users", fileName);
  }

  // Set new photo URL (consistent with author controller pattern)
  const photoURL = `${req.protocol}://${req.get("host")}/uploads/users/${req.file.filename}`;

  try {
    // Update user with new photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photo: photoURL },
      { new: true, runValidators: true }
    );

    // Only delete old photo AFTER successful database update
    if (oldPhotoPath) {
      try {
        await fs.unlink(oldPhotoPath);
        console.log("Old photo deleted successfully");
      } catch (error) {
        console.log("Error deleting old photo:", error.message);
        // Don't fail the request if old photo deletion fails
      }
    }

    res.status(200).json({
      status: "success",
      message: "Photo updated successfully!",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        const filePath = path.join(__dirname, "..", "uploads", "users", req.file.filename);
        await fs.unlink(filePath);
      } catch (deleteError) {
        console.log("Error deleting new file after failed update:", deleteError.message);
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join('. '), 400));
    }

    return next(error);
  }
});

// Delete user photo
exports.deleteUserPhotoController = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  // Delete current photo if it exists and is not default
  if (user.photo && user.photo !== "default.jpg") {
    await deleteOldPhoto(user.photo);
  }

  // Set photo to default
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { photo: "default.jpg" },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Photo deleted successfully!",
    data: {
      user: updatedUser,
    },
  });
});

// Update password
exports.updatePasswordController = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { currentPassword, password, confirmPassword } = req.body;

  // Check if all required fields are provided
  if (!currentPassword || !password || !confirmPassword) {
    return next(
      new AppError(
        "Please provide current password, new password and confirm password!",
        400
      )
    );
  }

  // Get user from collection (with password field)
  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  // Check if current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Your current password is incorrect!", 401));
  }

  // Check if new password is different from current password
  if (await user.correctPassword(password, user.password)) {
    return next(
      new AppError("New password must be different from current password!", 400)
    );
  }

  // Update password
  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save(); // This will trigger the pre-save middleware to hash password

  res.status(200).json({
    status: "success",
    message: "Password updated successfully!",
  });
});

// ====================== ACCOUNT MANAGEMENT CONTROLLERS ======================

// Deactivate user account
exports.deactivateAccountController = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(
      new AppError("Please provide your password to deactivate account!", 400)
    );
  }

  // Get user with password
  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  // Check if account is already deactivated
  if (user.active === false) {
    return next(new AppError("Account is already deactivated!", 400));
  }

  // Verify password
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password!", 401));
  }

  // Deactivate account
  await User.findByIdAndUpdate(userId, { active: false });

  res.status(200).json({
    status: "success",
    message: "Account deactivated successfully!",
  });
});

// Reactivate user account
exports.reactivateAccountController = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // Find user even if inactive (bypass the query middleware)
  const user = await User.findOne({ email }).select("+password +active");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  if (user.active !== false) {
    return next(new AppError("Account is already active!", 400));
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return next(
      new AppError(
        "Please verify your email address before reactivating account!",
        401
      )
    );
  }

  // Reactivate account
  await User.findByIdAndUpdate(user._id, { active: true });

  // Remove sensitive fields from output
  user.password = undefined;
  user.active = undefined;

  res.status(200).json({
    status: "success",
    message: "Account reactivated successfully!",
    data: {
      user,
    },
  });
});

// ====================== ADMIN CONTROLLERS ======================

// Update user email verification status (Admin only)
exports.updateEmailVerificationController = catchAsync(
  async (req, res, next) => {
    const { userId } = req.params;
    const { emailVerified } = req.body;

    if (typeof emailVerified !== "boolean") {
      return next(new AppError("emailVerified must be a boolean value!", 400));
    }

    const updateData = { emailVerified };

    // If setting to verified, remove verification token fields
    if (emailVerified) {
      updateData.$unset = {
        emailVerificationToken: 1,
        emailVerificationExpires: 1,
      };
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError("User not found!", 404));
    }

    res.status(200).json({
      status: "success",
      message: `Email verification status updated to ${
        emailVerified ? "verified" : "unverified"
      }!`,
      data: {
        user,
      },
    });
  }
);

// ====================== BULK OPERATIONS ======================

// Upload multiple photos (Admin/Bulk operation)
exports.uploadMultiplePhotos = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10, // Maximum 10 files
  },
}).array("photos", 10);

// Process multiple photos
exports.processMultiplePhotos = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("Please upload at least one photo!", 400));
  }

  req.files.forEach((file, index) => {
    file.filename = `batch-${Date.now()}-${index}-${Math.random()
      .toString(36)
      .substr(2, 9)}.jpeg`;
  });

  // Process all files
  await Promise.all(
    req.files.map(async (file) => {
      const uploadDir = path.join(__dirname, "../uploads/users");

      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(path.join(uploadDir, file.filename));
    })
  );

  next();
});

// ====================== ERROR HANDLING ======================

// Error handling middleware for multer
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(
          "File too large! Please upload images smaller than 5MB.",
          400
        )
      );
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(
        new AppError("Too many files! Maximum 10 files allowed.", 400)
      );
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new AppError(
          "Unexpected field! Please check your form field names.",
          400
        )
      );
    }
  }
  
  // Handle file filter errors
  if (err.message === "Only image files are allowed!") {
    return next(new AppError("Only image files are allowed!", 400));
  }
  
  next(err);
};


// ====================== USER MANAGEMENT CONTROLLERS ======================

// Get all users (Admin only)
exports.getAllUsersController = catchAsync(async (req, res, next) => {
  // Extract query parameters for filtering, sorting, and pagination
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    role,
    emailVerified,
    active,
    search
  } = req.query;

  // Build filter object
  const filter = {};
  
  // Role filter
  if (role && role !== 'all') {
    filter.role = role;
  }
  
  // Email verification filter
  if (emailVerified && emailVerified !== 'all') {
    filter.emailVerified = emailVerified === 'true';
  }
  
  // Active status filter
  if (active && active !== 'all') {
    filter.active = active === 'true';
  }
  
  // Search filter (name or email)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  
  try {
    // Get users with pagination, filtering, and sorting
    const users = await User.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      status: "success",
      results: users.length,
      totalUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      data: {
        users
      }
    });
  } catch (error) {
    return next(new AppError("Error fetching users", 500));
  }
});

// Get user statistics (Admin only)
exports.getUserStatsController = catchAsync(async (req, res, next) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get verified users count
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    
    // Get unverified users count
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });
    
    // Get active users count
    const activeUsers = await User.countDocuments({ active: true });
    
    // Get inactive users count
    const inactiveUsers = await User.countDocuments({ active: false });
    
    // Get admin users count
    const adminUsers = await User.countDocuments({ role: 'aklogicAdmin' });
    
    // Get regular users count
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Get users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        regularUsers,
        recentUsers,
        usersByMonth
      }
    });
  } catch (error) {
    return next(new AppError("Error fetching user statistics", 500));
  }
});

// Search users (Admin only)
exports.searchUsersController = catchAsync(async (req, res, next) => {
  const { q, limit = 10 } = req.query;
  
  if (!q) {
    return next(new AppError("Search query is required!", 400));
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
    .limit(parseInt(limit));

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    return next(new AppError("Error searching users", 500));
  }
});

// Get users by role (Admin only)
exports.getUsersByRoleController = catchAsync(async (req, res, next) => {
  const { role } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!['user', 'aklogicAdmin'].includes(role)) {
    return next(new AppError("Invalid role specified!", 400));
  }

  const skip = (page - 1) * limit;

  try {
    const users = await User.find({ role })
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments({ role });
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      status: "success",
      results: users.length,
      totalUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      data: {
        users
      }
    });
  } catch (error) {
    return next(new AppError("Error fetching users by role", 500));
  }
});