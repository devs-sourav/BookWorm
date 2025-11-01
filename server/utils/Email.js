const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url = "http://localhost:5173") {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `BookWorm <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Base email template with modern styling
  getBaseTemplate(content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BookWorm</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f8fafc;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 0;
        }
        
        .email-content {
          background: #ffffff;
          margin: 0 20px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .tagline {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 400;
        }
        
        .email-body {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }
        
        .content-text {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          margin: 16px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.3);
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px 0 rgba(102, 126, 234, 0.4);
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 32px 0;
        }
        
        .email-footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 10px;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .warning-box {
          background: #fef3cd;
          border: 1px solid #f6e05e;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          color: #744210;
        }
        
        .success-box {
          background: #d1fae5;
          border: 1px solid #6ee7b7;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          color: #065f46;
        }
        
        @media (max-width: 600px) {
          .email-container {
            padding: 20px 0;
          }
          
          .email-content {
            margin: 0 10px;
          }
          
          .email-header, .email-body, .email-footer {
            padding: 30px 20px;
          }
          
          .greeting {
            font-size: 20px;
          }
          
          .content-text {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-content">
          <div class="email-header">
            <div class="logo">📚 BookWorm</div>
            <div class="tagline">Your Literary Journey Starts Here</div>
          </div>
          
          <div class="email-body">
            ${content}
          </div>
          
          <div class="email-footer">
            <div class="footer-text">
              Thank you for choosing BookWorm. We're here to help you discover your next great read.
            </div>
            <div class="social-links">
              <a href="http://localhost:5173" class="social-link">Website</a> |
              <a href="http://localhost:5173/support" class="social-link">Support</a> |
              <a href="http://localhost:5173/unsubscribe" class="social-link">Unsubscribe</a>
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
              © 2025 BookWorm. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Send the actual email
  async send(html, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {
        wordwrap: 130,
        selectors: [
          { selector: "a", options: { ignoreHref: false } },
          { selector: "img", format: "skip" },
        ],
      }),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const content = `
      <div class="greeting">Welcome to BookWorm, ${this.firstName}! 🎉</div>
      
      <div class="content-text">
        We're absolutely thrilled to have you join our community of book lovers! BookWorm is more than just a bookstore – it's your gateway to countless adventures, knowledge, and stories waiting to be discovered.
      </div>
      
      <div class="success-box">
        <strong>What's next?</strong><br>
        Explore our curated collection, discover new authors, and find your next favorite book. We've got everything from bestsellers to hidden gems!
      </div>
      
      <div style="text-align: center;">
        <a href="${this.url}" class="cta-button">Verify Email</a>
      </div>
      
      <div class="divider"></div>
      
      <div class="content-text">
        Need help getting started? Our support team is here to assist you every step of the way.
      </div>
    `;

    const html = this.getBaseTemplate(content);
    await this.send(html, "🎉 Welcome to the BookWorm Family!");
  }

  async sendPasswordReset() {
    const content = `
      <div class="greeting">Password Reset Request</div>
      
      <div class="content-text">
        Hi ${this.firstName},<br><br>
        We received a request to reset your password. No worries – it happens to the best of us! Click the button below to create a new password and get back to browsing your favorite books.
      </div>
      
      <div class="warning-box">
        <strong>⚠️ Security Notice:</strong><br>
        This reset link is valid for only 10 minutes for your security. If you didn't request this reset, please ignore this email – your account remains secure.
      </div>
      
      <div style="text-align: center;">
        <a href="${this.url}" class="cta-button">Reset My Password</a>
      </div>
      
      <div class="divider"></div>
      
      <div class="content-text">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${this.url}" style="color: #667eea; word-break: break-all;">${this.url}</a>
      </div>
      
      <div class="content-text">
        <strong>Best regards,</strong><br>
        The BookWorm Security Team
      </div>
    `;

    const html = this.getBaseTemplate(content);
    await this.send(html, "🔐 Password Reset Request - BookWorm");
  }

  async sendInvoice(order) {
    // Validate order data structure
    if (
      !order.products ||
      !Array.isArray(order.products) ||
      order.products.length === 0
    ) {
      throw new Error("Order must have products array");
    }

    const productsHtml = order.products
      .map((productItem) => {
        // Extract product information from the nested structure
        let productTitle = "Product";
        let productPrice = 0;
        let salePrice = null;
        let quantity = productItem.quantity || 1;
        let isbn = "";
        let author = "";
        let format = "";

        // Check if product is populated (from populate query)
        if (productItem.product && typeof productItem.product === "object") {
          productTitle =
            productItem.product.title || productItem.title || "Product";
          productPrice = productItem.product.price || 0;
          salePrice = productItem.product.salePrice;
          isbn = productItem.product.isbn || productItem.isbn || "";
          author = productItem.author || "Unknown Author";
          format = productItem.product.format || productItem.format || "";
        } else {
          // Fallback to direct properties
          productTitle = productItem.title || "Product";
          productPrice = productItem.price || 0;
          salePrice = productItem.salePrice;
          isbn = productItem.isbn || "";
          author = productItem.author || "";
          format = productItem.format || "";
        }

        // Use sale price if available, otherwise regular price
        const finalPrice = salePrice || productPrice;
        const subtotal = finalPrice * quantity;
        const hasDiscount = salePrice && salePrice < productPrice;

        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 16px; color: #111827;">
            <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">${productTitle}</div>
            <div style="font-size: 13px; color: #6b7280;">
              ${author ? `by ${author}` : ""}${author && isbn ? " • " : ""}${
          isbn ? `ISBN: ${isbn}` : ""
        }
            </div>
            ${
              format
                ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">${format}</div>`
                : ""
            }
          </td>
          <td style="padding: 16px; text-align: center; color: #374151; font-weight: 500;">
            ${quantity}
          </td>
          <td style="padding: 16px; text-align: center; color: #374151;">
            ${
              hasDiscount
                ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 13px;">৳${productPrice.toFixed(
                    2
                  )}</span><br>
               <span style="font-weight: 600; color: #ef4444;">৳${finalPrice.toFixed(
                 2
               )}</span>`
                : `<span style="font-weight: 500;">৳${finalPrice.toFixed(
                    2
                  )}</span>`
            }
          </td>
          <td style="padding: 16px; text-align: center; font-weight: 600; color: #111827;">
            ৳${subtotal.toFixed(2)}
          </td>
        </tr>
      `;
      })
      .join("");

    // Calculate if there are any savings
    const totalSavings = order.products.reduce((savings, item) => {
      const originalPrice = item.product?.price || item.price || 0;
      const salePrice = item.product?.salePrice || item.salePrice;
      if (salePrice && salePrice < originalPrice) {
        return savings + (originalPrice - salePrice) * item.quantity;
      }
      return savings;
    }, 0);

    // Format delivery information
    const deliveryInfo =
      order.deliveryType === "on_demand"
        ? "Express Delivery"
        : "Standard Delivery";
    const estimatedDate = order.estimatedDeliveryDate
      ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "To be confirmed";

    const content = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">BookWorm</h1>
      <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Your Literary Adventure Begins Here</p>
    </div>
    
    <div style="padding: 32px; background: white;">
      <div style="margin-bottom: 32px;">
        <h2 style="color: #111827; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Order Confirmation</h2>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
          Hi <strong style="color: #111827;">${order.name}</strong>,<br><br>
          Thank you for choosing BookWorm! Your order has been confirmed and we're excited to get your books ready. 
          Here are the details of your purchase:
        </p>
      </div>

      <!-- Order Summary Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Order Number</div>
            <div style="font-size: 18px; font-weight: 700; color: #111827;">${
              order.formattedOrderNumber || order.orderNumber
            }</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Order Date</div>
            <div style="font-size: 16px; font-weight: 600; color: #111827;">
              ${new Date(order.createdAt).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Status</div>
            <div style="display: inline-block; background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase;">
              ${order.orderStatus}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Payment</div>
            <div style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase;">
              ${order.paymentStatus}
            </div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div style="margin-bottom: 32px;">
        <h3 style="color: #111827; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Order Items</h3>
        <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; font-size: 14px;">BOOK DETAILS</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; font-size: 14px;">QTY</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; font-size: 14px;">PRICE</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; font-size: 14px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Summary -->
      <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <h3 style="color: #111827; margin: 0 0 20px; font-size: 18px; font-weight: 600;">Order Summary</h3>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #6b7280;">Subtotal:</span>
          <span style="font-weight: 500; color: #374151;">৳${order.subtotal.toFixed(
            2
          )}</span>
        </div>
        
        ${
          totalSavings > 0
            ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #059669;">You Saved:</span>
          <span style="font-weight: 600; color: #059669;">-৳${totalSavings.toFixed(
            2
          )}</span>
        </div>
        `
            : ""
        }
        
        ${
          order.couponDiscount > 0
            ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #059669;">Coupon Discount:</span>
          <span style="font-weight: 600; color: #059669;">-৳${order.couponDiscount.toFixed(
            2
          )}</span>
        </div>
        `
            : ""
        }
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">Delivery (${deliveryInfo}):</span>
          <span style="font-weight: 500; color: ${
            order.shippingCost > 0 ? "#374151" : "#059669"
          };">
            ${
              order.shippingCost > 0
                ? `৳${order.shippingCost.toFixed(2)}`
                : "FREE 🎉"
            }
          </span>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 20px; font-weight: 700; color: #111827;">Total Amount:</span>
          <span style="font-size: 24px; font-weight: 700; color: #667eea;">৳${order.totalCost.toFixed(
            2
          )}</span>
        </div>
      </div>

      <!-- Delivery Information -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
        <h4 style="color: #92400e; margin: 0 0 12px; font-size: 16px; font-weight: 600;">📦 Delivery Information</h4>
        <div style="color: #78350f; margin-bottom: 8px;">
          <strong>Delivery Address:</strong> ${order.streetAddress}, ${
      order.area?.areaName || ""
    }, ${order.zone?.zoneName || ""}, ${order.city?.cityName || ""}
        </div>
        <div style="color: #78350f; margin-bottom: 8px;">
          <strong>Contact:</strong> ${order.phone}
        </div>
        <div style="color: #78350f;">
          <strong>Estimated Delivery:</strong> ${estimatedDate}
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin-bottom: 32px;">

        <a href="http://localhost:5173/contact" 
           style="display: inline-block; background: white; color: #667eea; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #667eea;">
          Contact Support
        </a>
      </div>

      <!-- Divider -->
      <div style="height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent); margin: 32px 0;"></div>

      <!-- Footer Message -->
      <div style="text-align: center; color: #6b7280; line-height: 1.6;">
        <p style="margin: 0 0 12px;">Need help with your order? Our support team is ready to assist you!</p>
        <p style="margin: 0; font-size: 14px;">
          Email: support@bookworm.com • Phone: +880-1629169610<br>
          <span style="color: #9ca3af;">Thank you for choosing BookWorm for your literary journey! 📚</span>
        </p>
      </div>
    </div>
  `;

    const html = this.getBaseTemplate(content);
    await this.send(
      html,
      `📚 Order Confirmed - BookWorm ${
        order.formattedOrderNumber || order.orderNumber
      }`
    );
  }

  async sendInvoiceWithCoupon(order, discountInfo) {
    // Validate order data structure
    if (
      !order.products ||
      !Array.isArray(order.products) ||
      order.products.length === 0
    ) {
      throw new Error("Order must have products array");
    }

    const productsHtml = order.products
      .map((productItem) => {
        // Handle different possible data structures
        let productTitle = "Product";
        let productPrice = 0;
        let salePrice = 0;
        let quantity = productItem.quantity || 1;
        let subtotal = 0;

        // Check if product is populated (from populate query)
        if (
          productItem.product &&
          typeof productItem.product === "object" &&
          productItem.product.title
        ) {
          productTitle = productItem.product.title;
          // Use the stored price from order item first, then fallback to product price
          productPrice = productItem.price || productItem.product.price || 0;
          salePrice =
            productItem.salePrice ||
            productItem.product.salePrice ||
            productPrice;
        } else {
          // Fallback to direct properties on the order item
          productTitle = productItem.title || "Product";
          productPrice = productItem.price || 0;
          salePrice = productItem.salePrice || productPrice;
        }

        // Use sale price for calculation if available and different from regular price
        const effectivePrice =
          salePrice && salePrice < productPrice ? salePrice : productPrice;
        subtotal = effectivePrice * quantity;

        return `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 16px 12px; font-weight: 500; color: #1f2937;">
            ${productTitle}
            ${
              productItem.isbn
                ? `<br><small style="color: #6b7280; font-size: 12px;">ISBN: ${productItem.isbn}</small>`
                : ""
            }
            ${
              productItem.author
                ? `<br><small style="color: #6b7280; font-size: 12px;">Author: ${productItem.author}</small>`
                : ""
            }
          </td>
          <td style="padding: 16px 12px; text-align: center; color: #6b7280;">
            ${quantity}
          </td>
          <td style="padding: 16px 12px; text-align: center; color: #1f2937;">
            ${
              salePrice && salePrice < productPrice
                ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 12px;">৳${productPrice.toFixed(
                    2
                  )}</span><br>৳${salePrice.toFixed(2)}`
                : `৳${productPrice.toFixed(2)}`
            }
          </td>
          <td style="padding: 16px 12px; text-align: center; font-weight: 600; color: #1f2937;">
            ৳${subtotal.toFixed(2)}
          </td>
        </tr>
      `;
      })
      .join("");

    // Calculate product total using the same logic as above
    const productTotal = order.products.reduce((total, productItem) => {
      const price = productItem.price || 0;
      const salePrice = productItem.salePrice || price;
      const effectivePrice = salePrice && salePrice < price ? salePrice : price;
      const quantity = productItem.quantity || 1;
      return total + effectivePrice * quantity;
    }, 0);

    // Get discount information - use passed discountInfo or fallback to order data
    const couponDiscount = discountInfo?.amount || order.couponDiscount || 0;
    const discountType =
      discountInfo?.type || order.couponDiscountType || "amount";
    const discountValue = discountInfo?.value || 0;

    // Get user name from order or user object
    const userName =
      order.name || order.user?.name || this.firstName || "Customer";

    const content = `
    <div class="greeting">Your Order Invoice 🎉</div>
    
    <div class="content-text">
      Hi ${userName},<br><br>
      Fantastic news! ${
        couponDiscount > 0
          ? "Your coupon has been applied and you're saving big!"
          : "Your order has been confirmed!"
      } Here are your order details:
    </div>
    
    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <div style="margin-bottom: 16px;">
        <strong style="color: #1f2937;">Order Number:</strong> ${
          order.formattedOrderNumber || order.orderNumber || order._id
        }
        <br>
        <strong style="color: #1f2937;">Order Date:</strong> ${new Date(
          order.createdAt
        ).toLocaleDateString()}
        ${
          order.estimatedDeliveryDate
            ? `<br><strong style="color: #1f2937;">Estimated Delivery:</strong> ${new Date(
                order.estimatedDeliveryDate
              ).toLocaleDateString()}`
            : ""
        }
      </div>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <th style="padding: 16px 12px; text-align: left; font-weight: 600;">Product</th>
            <th style="padding: 16px 12px; text-align: center; font-weight: 600;">Qty</th>
            <th style="padding: 16px 12px; text-align: center; font-weight: 600;">Price</th>
            <th style="padding: 16px 12px; text-align: center; font-weight: 600;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>
    </div>
    
    <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #374151;">Subtotal:</span>
        <span style="color: #6b7280;">৳${(
          order.subtotal || productTotal
        ).toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #374151;">Shipping Cost:</span>
        <span style="color: ${order.shippingCost > 0 ? "#1f2937" : "#059669"};">
          ${
            order.shippingCost > 0
              ? `৳${order.shippingCost.toFixed(2)}`
              : "FREE 🎉"
          }
        </span>
      </div>
      ${
        couponDiscount > 0
          ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #dc2626; font-weight: 500;">
        <span>🎟️ Coupon Discount ${
          discountType === "percentage" ? `(${discountValue}%)` : ""
        }:</span>
        <span>-৳${couponDiscount.toFixed(2)}</span>
      </div>
      `
          : ""
      }
      <div style="border-top: 2px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between;">
        <span style="font-size: 18px; font-weight: 600; color: #1f2937;">Final Total:</span>
        <span style="font-size: 20px; font-weight: 700; color: #059669;">৳${order.totalCost.toFixed(
          2
        )}</span>
      </div>
    </div>
    
    ${
      couponDiscount > 0
        ? `
    <div class="success-box">
      <strong>🎊 Congratulations! You saved ৳${couponDiscount.toFixed(
        2
      )} with your coupon!</strong><br>
      Order Status: ${order.orderStatus.toUpperCase()}
    </div>
    `
        : `
    <div class="success-box">
      <strong>✅ Order Confirmed!</strong><br>
      Order Status: ${order.orderStatus.toUpperCase()}
    </div>
    `
    }
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
        <div>
          <strong style="color: #374151;">Delivery Address:</strong><br>
          ${order.streetAddress}<br>
          ${order.area?.areaName || ""} ${order.zone?.zoneName || ""}<br>
          ${order.city?.cityName || ""}
        </div>
        <div>
          <strong style="color: #374151;">Contact:</strong><br>
          ${order.phone}<br>
          ${order.email}
        </div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${this.url}/orders" class="cta-button">Track Your Order</a>
    </div>
    
    <div class="divider"></div>
    
    <div class="content-text">
      Thank you for being a valued BookWorm customer! ${
        couponDiscount > 0
          ? "Keep an eye out for more exclusive deals and coupons."
          : "We hope you enjoy your books!"
      }
    </div>
  `;

    const html = this.getBaseTemplate(content);
    await this.send(
      html,
      `${
        couponDiscount > 0
          ? "🎉 Order Confirmed with Savings"
          : "📚 Order Confirmed"
      } - BookWorm #${
        order.formattedOrderNumber || order.orderNumber || order._id
      }`
    );
  }
};
