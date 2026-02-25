import React, { useEffect, useState } from "react";
import { Percent, Gift, Check } from "lucide-react";

const CouponTicker = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch("https://bookwormm.netlify.app/api/v1/coupon");
        const data = await response.json();
        setCoupons(data.data.doc || []);
      } catch (err) {
        console.error("Failed to load coupons", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (couponCode, id) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500); // Reset copy state
  };

  if (loading || coupons.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-2 overflow-hidden relative shadow-lg">
      {/* Header */}
      <div className="grid grid-cols-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 z-10  px-4 mb-1">
            <Gift className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold text-sm uppercase tracking-wide">
              Hot Coupons
            </span>
          </div>
        </div>{" "}
        <div className="col-span-10 relative">
          <div className="absolute left-0 bottom-0 w-full overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-10 px-4">
              {coupons.map((coupon) => (
                <button
                  key={coupon._id}
                  onClick={() => handleCopy(coupon.coupon, coupon._id)}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-sm transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-700"
                  title="Click to copy"
                  aria-label={`Copy coupon code ${coupon.coupon}`}
                >
                  {coupon.discountType === "percentage" ? (
                    <Percent className="h-3 w-3" />
                  ) : (
                    <span className="text-xs font-bold">৳</span>
                  )}

                  <span className="font-semibold">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountPercent}% OFF`
                      : `৳${coupon.discountAmount} OFF`}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono transition-colors ${
                      copiedId === coupon._id
                        ? "bg-green-500 text-white"
                        : "bg-white text-purple-700"
                    }`}
                  >
                    {copiedId === coupon._id ? (
                      <Check size={12} />
                    ) : (
                      coupon.coupon
                    )}
                  </span>

                  <span className="text-xs opacity-80">
                    Until{" "}
                    {new Date(coupon.validUntil).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Ticker container */}
      </div>

      {/* Animation style */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%) }
            100% { transform: translateX(-100%) }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
};

export default CouponTicker;
