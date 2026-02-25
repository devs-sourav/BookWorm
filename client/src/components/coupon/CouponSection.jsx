import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Gift,
  Percent,
  Calendar,
  Sparkles,
} from "lucide-react";

const CouponSection = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [showConfetti, setShowConfetti] = useState({});

  // Fetch coupons from API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch("https://bookworm-t3mi.onrender.com/api/v1/coupon");
        const data = await response.json();
        setCoupons(data.data.doc);
        setLoading(false);
      } catch (err) {
        setError("Failed to load coupons");
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Copy coupon code to clipboard
  const copyCoupon = async (couponCode, couponId) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCoupon(couponCode);

      // Show confetti animation
      setShowConfetti((prev) => ({ ...prev, [couponId]: true }));

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCoupon(null);
      }, 2000);

      // Reset confetti after animation
      setTimeout(() => {
        setShowConfetti((prev) => ({ ...prev, [couponId]: false }));
      }, 1000);
    } catch (err) {
      console.error("Failed to copy coupon:", err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if coupon is expiring soon (within 7 days)
  const isExpiringSoon = (validUntil) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  // Confetti Component
  const Confetti = ({ show }) => {
    if (!show) return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-bounce text-yellow-400 text-sm`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: "1s",
            }}
          >
            🎉
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 my-20">
      <div className="container mx-auto py-20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gift className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Exclusive Offers
            </h2>
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-gray-600">
            Save big with our limited-time coupons
          </p>
        </div>

        {/* Coupons Grid - More cards per row for smaller size */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <Confetti show={showConfetti[coupon._id]} />

              {/* Coupon Header - Reduced padding */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 text-white relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {coupon.discountType === "percentage" ? (
                      <Percent className="h-3 w-3" />
                    ) : (
                      <span className="text-sm font-bold">৳</span>
                    )}
                    <span className="font-semibold text-sm">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountPercent} OFF`
                        : `${coupon.discountAmount} OFF`}
                    </span>
                  </div>
                  {isExpiringSoon(coupon.validUntil) && (
                    <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold animate-pulse">
                      SOON!
                    </span>
                  )}
                </div>
              </div>

              {/* Coupon Body - Reduced padding */}
              <div className="p-3">
                {/* Coupon Code - Smaller */}
                <div
                  className="bg-gray-50 rounded-md p-2 mb-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 border border-dashed border-gray-300 group-hover:border-purple-300"
                  onClick={() => copyCoupon(coupon.coupon, coupon._id)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 tracking-wide mb-1">
                      {coupon.coupon}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {copiedCoupon === coupon.coupon ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="h-3 w-3" />
                          <span className="text-xs font-medium">Copied!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors">
                          <Copy className="h-3 w-3" />
                          <span className="text-xs">Copy</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validity Period - Smaller text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                      {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                    </span>
                  </div>

                  {/* Status Badge - Smaller */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {coupon.isActive ? "✅" : "❌"}
                    </span>

                    <div className="text-xs text-gray-400">
                      {formatDate(coupon.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Gradient Border - Thinner */}
              <div className="h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {coupons.length === 0 && (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No coupons available
            </h3>
            <p className="text-gray-500 text-sm">Check back later for amazing deals!</p>
          </div>
        )}

        {/* Footer Note - Smaller */}
        {coupons.length > 0 && (
          <div className="text-center mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-xs">
              💡 <strong>Pro Tip:</strong> Click on any coupon code to copy it instantly!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponSection;