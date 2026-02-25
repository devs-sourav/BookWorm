import React, { useState, useEffect } from "react";
import { FaHome, FaChevronRight, FaStore, FaTags, FaBookOpen } from "react-icons/fa";
import { MdPublish, MdCategory, MdLocalOffer } from "react-icons/md";
import { BiLoader } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Containar from "../../layouts/Containar";

const BreadcrumbShop = () => {
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/").filter(Boolean);
  
  const [breadcrumbData, setBreadcrumbData] = useState({
    title: "",
    loading: false,
    error: null,
    type: null
  });

  const isShopOnly = segments.length === 1 && segments[0] === "shop";
  const lastSegment = segments[segments.length - 1];

  // Get breadcrumb type and icon
  const getBreadcrumbType = () => {
    if (segments.includes("category")) return "category";
    if (segments.includes("subcategory")) return "subcategory";
    if (segments.includes("brand")) return "brand";
    if (segments.includes("mega-sale")) return "mega-sale";
    if (segments.includes("latest-sale")) return "latest-sale";
    if (segments.includes("offer-sale")) return "offer";
    if (segments.includes("search")) return "search";
    return "shop";
  };

const getIcon = (type) => {
  const iconProps = { className: "w-4 h-4" };
  switch (type) {
    case "category":
      return <MdCategory {...iconProps} style={{ color: "#3b82f6" }} />; // Blue
    case "subcategory":
      return <FaBookOpen {...iconProps} style={{ color: "#059669" }} />; // Green
    case "brand":
      return <MdPublish {...iconProps} style={{ color: "#7c3aed" }} />; // Purple
    case "mega-sale":
      return <MdLocalOffer {...iconProps} style={{ color: "#ef4444" }} />; // Red (existing)
    case "latest-sale":
      return <MdLocalOffer {...iconProps} style={{ color: "#f59e0b" }} />; // Amber (existing)
    case "offer":
      return <MdLocalOffer {...iconProps} style={{ color: "#F97217" }} />; // Orange (existing)
    case "search":
      return <FaTags {...iconProps} style={{ color: "#6366f1" }} />; // Indigo
    default:
      return <FaStore {...iconProps} style={{ color: "#6b7280" }} />; // Gray
  }
};

  const getDisplayName = (type, title) => {
    if (!title && type !== "mega-sale" && type !== "latest-sale") return type;
    
    switch (type) {
      case "brand":
        return `${title} Publisher`;
      case "category":
        return `${title} Books`;
      case "subcategory":
        return title;
      case "mega-sale":
        return "Mega Sale";
      case "latest-sale":
        return "Latest Sale";
      case "offer":
        return "Special Offers";
      case "search":
        return `Search Results`;
      default:
        return title;
    }
  };

  useEffect(() => {
    const type = getBreadcrumbType();
    
    // Handle special cases without API calls
    if (isShopOnly) {
      setBreadcrumbData({ title: "", loading: false, error: null, type: "shop" });
      return;
    }

    if (type === "offer" || type === "search" || type === "mega-sale" || type === "latest-sale") {
      let displayTitle;
      switch (type) {
        case "mega-sale":
          displayTitle = "Mega Sale";
          break;
        case "latest-sale":
          displayTitle = "Latest Sale";
          break;
        case "offer":
          displayTitle = "Special Offers";
          break;
        case "search":
          displayTitle = "Search Results";
          break;
        default:
          displayTitle = type;
      }
      setBreadcrumbData({ title: displayTitle, loading: false, error: null, type });
      return;
    }

    // Handle API calls for category, subcategory, brand
    let apiUrl;
    if (type === "category") {
      apiUrl = `https://bookworm-t3mi.onrender.com/api/v1/category/${lastSegment}`;
    } else if (type === "subcategory") {
      apiUrl = `https://bookworm-t3mi.onrender.com/api/v1/subcategory/${lastSegment}`;
    } else if (type === "brand") {
      apiUrl = `https://bookworm-t3mi.onrender.com/api/v1/brand/${lastSegment}`;
    }

    if (apiUrl) {
      setBreadcrumbData(prev => ({ ...prev, loading: true, error: null, type }));
      
      axios
        .get(apiUrl)
        .then((response) => {
          const dataTitle = response.data.data.doc?.title || lastSegment;
          setBreadcrumbData({
            title: dataTitle,
            loading: false,
            error: null,
            type
          });
        })
        .catch((error) => {
          console.error("Error fetching breadcrumb data:", error);
          setBreadcrumbData({
            title: lastSegment.replace(/-/g, ' '), // Fallback: convert hyphens to spaces
            loading: false,
            error: "Failed to load data",
            type
          });
        });
    }
  }, [path, isShopOnly, lastSegment]);

  const BreadcrumbItem = ({ to, children, isLast = false, icon, isLoading = false }) => {
    const baseClasses = "flex items-center gap-2 transition-all duration-200 text-sm font-medium";
    const linkClasses = `${baseClasses} text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md`;
    const lastClasses = `${baseClasses} text-gray-800 bg-gray-100 px-3 py-2 rounded-md`;

    if (isLast) {
      return (
        <span className={lastClasses}>
          {icon}
          {isLoading ? (
            <div className="flex items-center gap-2">
              <BiLoader className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <span className="capitalize">{children}</span>
          )}
        </span>
      );
    }

    return (
      <Link to={to} className={linkClasses}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  };

  const Separator = () => (
    <FaChevronRight className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0" />
  );

  return (
    <section className="bg-white border-b border-gray-200 shadow-sm">
      <Containar>
        <div className="py-4">
          {/* Main Breadcrumb Navigation */}
          <nav className="flex items-center flex-wrap gap-2" aria-label="Breadcrumb">
            {/* Home */}
            <BreadcrumbItem to="/" icon={<FaHome className="w-4 h-4" />}>
              Home
            </BreadcrumbItem>

            <Separator />

            {/* Shop */}
            <BreadcrumbItem 
              to="/shop" 
              icon={<FaStore className="w-4 h-4" />}
              isLast={isShopOnly}
            >
              Shop
            </BreadcrumbItem>

            {/* Dynamic breadcrumb for specific pages */}
            {!isShopOnly && (
              <>
                <Separator />
                <BreadcrumbItem
                  to={path}
                  icon={getIcon(breadcrumbData.type)}
                  isLast={true}
                  isLoading={breadcrumbData.loading}
                >
                  {breadcrumbData.loading 
                    ? "Loading..." 
                    : getDisplayName(breadcrumbData.type, breadcrumbData.title)
                  }
                </BreadcrumbItem>
              </>
            )}
          </nav>

          {/* Additional context information */}
          {!isShopOnly && !breadcrumbData.loading && breadcrumbData.title && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {getIcon(breadcrumbData.type)}
                  <span>
                    {breadcrumbData.type === "category" && "Browse books by category"}
                    {breadcrumbData.type === "subcategory" && "Specialized book collection"}
                    {breadcrumbData.type === "brand" && "Books from trusted publisher"}
                    {breadcrumbData.type === "mega-sale" && "Huge discounts on selected books"}
                    {breadcrumbData.type === "latest-sale" && "New arrivals at special prices"}
                    {breadcrumbData.type === "offer" && "Limited time deals and discounts"}
                    {breadcrumbData.type === "search" && "Find your perfect book"}
                  </span>
                </div>
                
                {breadcrumbData.error && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <span>⚠</span>
                    <span>Using fallback data</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Containar>

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": window.location.origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop",
                "item": `${window.location.origin}/shop`
              },
              ...((!isShopOnly && breadcrumbData.title) ? [{
                "@type": "ListItem",
                "position": 3,
                "name": getDisplayName(breadcrumbData.type, breadcrumbData.title),
                "item": window.location.href
              }] : [])
            ]
          })
        }}
      />
    </section>
  );
};

export default BreadcrumbShop;