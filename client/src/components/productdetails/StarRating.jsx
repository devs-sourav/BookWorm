import React, { useState } from "react";

// SVG Star Component with fractional fill support
const SvgStar = ({ 
  fillPercentage = 0, 
  size = 20, 
  filledColor = "#FBBF24", // yellow-400
  emptyColor = "#D1D5DB", // gray-300
  strokeColor = "#FBBF24",
  strokeWidth = 1,
  interactive = false,
  onHover = null,
  onClick = null
}) => {
  const starId = `star-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}
      onMouseEnter={onHover}
      onClick={onClick}
    >
      <defs>
        <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercentage}%`} stopColor={filledColor} />
          <stop offset={`${fillPercentage}%`} stopColor={emptyColor} />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={`url(#${starId})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Enhanced Star Rating Component with SVG support
const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = "w-5 h-5", // Keep your existing size prop format
  maxRating = 5,
  filledColor = "#FBBF24", // yellow-400
  emptyColor = "#D1D5DB", // gray-300
  hoverColor = "#F59E0B", // yellow-500
  strokeColor = "#FBBF24",
  strokeWidth = 1,
  className = ""
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const currentRating = hoveredRating || rating;
  
  // Convert Tailwind size classes to pixel values
  const getSizeInPixels = (sizeClass) => {
    const sizeMap = {
      "w-3 h-3": 12,
      "w-4 h-4": 16,
      "w-5 h-5": 20,
      "w-6 h-6": 24,
      "w-8 h-8": 32,
    };
    return sizeMap[sizeClass] || 20;
  };
  
  const pixelSize = getSizeInPixels(size);
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      let fillPercentage = 0;
      let starFilledColor = filledColor;
      
      // Calculate fill percentage for fractional ratings
      if (currentRating >= i) {
        fillPercentage = 100;
      } else if (currentRating > i - 1) {
        fillPercentage = ((currentRating - (i - 1)) * 100);
      }
      
      // Use hover color when hovering (for interactive mode)
      if (hoveredRating > 0 && i <= hoveredRating) {
        starFilledColor = hoverColor;
        fillPercentage = 100;
      }
      
      stars.push(
        <SvgStar
          key={i}
          fillPercentage={fillPercentage}
          size={pixelSize}
          filledColor={starFilledColor}
          emptyColor={emptyColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          interactive={!readonly}
          onHover={() => !readonly && setHoveredRating(i)}
          onClick={() => !readonly && onRatingChange && onRatingChange(i)}
        />
      );
    }
    
    return stars;
  };

  return (
    <div 
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={() => !readonly && setHoveredRating(0)}
    >
      {renderStars()}
    </div>
  );
};

export default StarRating;