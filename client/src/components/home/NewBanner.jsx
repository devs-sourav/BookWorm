import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ApiContext from "../baseapi/BaseApi";
import bannerbg from "../../assets/banner/bannerbg.jpg";

export default function BannerSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [topBannerSlide, setTopBannerSlide] = useState(0);
  const [bottomBannerSlide, setBottomBannerSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // API integration states
  const [bannerList, setBannerList] = useState([]);
  const [topBannerList, setTopBannerList] = useState([]);
  const [bottomBannerList, setBottomBannerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseApi = useContext(ApiContext);

  // Helper function to get internal path for React Router Link
  const getInternalPath = (link) => {
    if (!link) return "/";
    
    let cleanLink = link.trim();
    
    // If it's already a relative path, return as is
    if (cleanLink.startsWith("/")) return cleanLink;
    
    // Remove protocol if present (http://, https://)
    cleanLink = cleanLink.replace(/^https?:\/\//, '');
    
    // Check if it contains the current hostname
    const hostname = window.location.hostname;
    const port = window.location.port;
    const hostWithPort = port ? `${hostname}:${port}` : hostname;
    
    if (cleanLink.includes(hostWithPort)) {
      // Extract the path part after the hostname:port
      const pathIndex = cleanLink.indexOf(hostWithPort) + hostWithPort.length;
      cleanLink = cleanLink.substring(pathIndex) || "/";
    } else if (cleanLink.includes(hostname)) {
      // Handle case without port
      const pathIndex = cleanLink.indexOf(hostname) + hostname.length;
      cleanLink = cleanLink.substring(pathIndex) || "/";
    }
    
    // Ensure leading slash
    if (!cleanLink.startsWith("/")) {
      cleanLink = `/${cleanLink}`;
    }
    
    return cleanLink;
  };

  // Skeleton component for empty main slider
  const MainSliderSkeleton = () => (
    <div
      className="relative w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-[590px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
      style={{
        backgroundImage: `url(${bannerbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm">
        <div className="relative w-full h-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 px-6 sm:px-10 lg:px-20">
          {/* Text Section Skeleton */}
          <div className="w-full lg:w-1/2 space-y-4 text-center lg:text-left">
            <div className="h-4 bg-gray-300 rounded w-48 mx-auto lg:mx-0 animate-pulse"></div>
            <div className="h-8 sm:h-12 bg-gray-300 rounded w-full max-w-80 mx-auto lg:mx-0 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-64 mx-auto lg:mx-0 animate-pulse"></div>
            <div className="!mt-8 lg:!mt-12 h-12 bg-gray-300 rounded w-32 mx-auto lg:mx-0 animate-pulse"></div>
          </div>

          {/* Image Skeleton */}
          <div className="w-full lg:w-1/2 h-[200px] sm:h-[280px] lg:h-[360px] bg-gray-300 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">
              <svg
                className="w-16 h-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Skeleton navigation buttons */}
        <div className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-gray-300 rounded animate-pulse"></div>
        <div className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-gray-300 rounded animate-pulse"></div>

        {/* Skeleton pagination dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Skeleton component for empty side banners
  const SideBannerSkeleton = ({ label }) => (
    <div className="bg-gray-100 h-[200px] sm:h-[287px] relative rounded-lg overflow-hidden shadow-lg animate-pulse">
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg
            className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs sm:text-sm">{label}</p>
        </div>
      </div>
    </div>
  );

  // Fetch banner data from API using the controller endpoints
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        // Fetch only active banners
        const response = await axios.get(`${baseApi}/banner/active`);

        // Check if response has the expected structure based on your controller
        const banners =
          response.data?.data?.banners || response.data?.data?.doc || [];

        // Filter banners by type (matching your controller's valid types)
        const mainBanners = banners.filter(
          (item) =>
            item?.bannerType === "Main Banner" && item?.isActive !== false
        );
        const topBanners = banners.filter(
          (item) =>
            item?.bannerType === "top banner" && item?.isActive !== false
        );
        const bottomBanners = banners.filter(
          (item) =>
            item?.bannerType === "bottom banner" && item?.isActive !== false
        );

        setBannerList(mainBanners);
        setTopBannerList(topBanners);
        setBottomBannerList(bottomBanners);
        setLoading(false);
      } catch (err) {
        console.error("Banner API Error:", err);
        setError(err);

        // Try alternative endpoint if the first fails
        try {
          const fallbackResponse = await axios.get(`${baseApi}/banner`);
          const allBanners =
            fallbackResponse.data?.data?.banners ||
            fallbackResponse.data?.data?.doc ||
            [];

          // Filter only active banners
          const activeBanners = allBanners.filter(
            (banner) => banner.isActive !== false
          );

          const mainBanners = activeBanners.filter(
            (item) => item?.bannerType === "Main Banner"
          );
          const topBanners = activeBanners.filter(
            (item) => item?.bannerType === "top banner"
          );
          const bottomBanners = activeBanners.filter(
            (item) => item?.bannerType === "bottom banner"
          );

          setBannerList(mainBanners);
          setTopBannerList(topBanners);
          setBottomBannerList(bottomBanners);
          setLoading(false);
        } catch (secondErr) {
          console.error("Fallback Banner API Error:", secondErr);
          setLoading(false);
          // Don't set any fallback data - just leave arrays empty
        }
      }
    };

    fetchBannerData();
  }, [baseApi]);

  // Auto-advance main slider - 15 seconds
  useEffect(() => {
    if (bannerList.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setActiveSlide((prev) => (prev + 1) % bannerList.length);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 15000);

    return () => clearInterval(interval);
  }, [bannerList.length]);

  // Auto-advance top banner - 15 seconds
  useEffect(() => {
    if (topBannerList.length === 0) return;

    const interval = setInterval(() => {
      setTopBannerSlide((prev) => (prev + 1) % topBannerList.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [topBannerList.length]);

  // Auto-advance bottom banner - 15 seconds
  useEffect(() => {
    if (bottomBannerList.length === 0) return;

    const interval = setInterval(() => {
      setBottomBannerSlide((prev) => (prev + 1) % bottomBannerList.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [bottomBannerList.length]);

  const nextSlide = () => {
    if (bannerList.length === 0) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => (prev + 1) % bannerList.length);
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const prevSlide = () => {
    if (bannerList.length === 0) return;
    setIsTransitioning(true);
    setActiveSlide(
      (prev) => (prev - 1 + bannerList.length) % bannerList.length
    );
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const goToSlide = (index) => {
    if (bannerList.length === 0) return;
    setIsTransitioning(true);
    setActiveSlide(index);
    setTimeout(() => setIsTransitioning(false), 100);
  };

  // Initial loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 py-10 bg-white w-full">
            <div className="w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-[590px] rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading banners...</div>
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-[435px] lg:flex-shrink-0">
              <div className="h-[200px] sm:h-[287px] rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="h-[200px] sm:h-[287px] rounded-lg bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 py-10 bg-white w-full">
          {/* Left Side Slider */}
          {bannerList.length > 0 ? (
            <div
              className="relative group w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-[590px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50"
              style={{
                backgroundImage: `url(${bannerbg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative w-full h-full text-black">
                {bannerList.map((slide, index) => (
                  <div
                    key={slide._id}
                    className={`absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 px-6 sm:px-10 lg:px-14 transition-opacity duration-600 ${
                      activeSlide === index ? "opacity-100" : "opacity-0"
                    } ${activeSlide === index ? "pointer-events-auto" : "pointer-events-none"}`}
                  >
                    {/* Text Section with left slide animation */}
                    <div
                      className={`z-10 w-full lg:w-[55%] space-y-3 text-center lg:text-left transition-all duration-1200 ease-out ${
                        !isTransitioning && activeSlide === index
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-32"
                      }`}
                      style={{
                        transitionDelay:
                          !isTransitioning && activeSlide === index
                            ? "200ms"
                            : "0ms",
                      }}
                    >
                      {slide.subTitle && (
                        <p className="text-base sm:text-base text-red-500 font-semibold capitalize">
                          {slide.subTitle}
                        </p>
                      )}
                      <h1 className="text-2xl sm:text-[20px] lg:text-[40px] font-inter font-bold text-[#292929] leading-[60px]">
                        {slide.title}
                      </h1>
                      {slide.description && (
                        <p className="text-sm sm:text-base text-gray-700 max-w-md mx-auto lg:mx-0">
                          {slide.description}
                        </p>
                      )}
                      
                      <Link
                        to={getInternalPath(slide.link)}
                        className="inline-block !mt-8 lg:!mt-12 px-8 sm:px-12 py-3 bg-gray-800 text-white text-sm sm:text-base font-medium rounded-sm hover:bg-gray-900 transition-colors duration-300"
                      >
                        Explore Now
                      </Link>
                    </div>

                    {/* Image with right slide animation */}
                    <Link
                      to={getInternalPath(slide.link)}
                      className={`relative w-full lg:w-[45%] h-[200px] sm:h-[280px] lg:h-[360px] transition-all duration-800 ease-out ${
                        !isTransitioning && activeSlide === index
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-24"
                      }`}
                      style={{
                        transitionDelay:
                          !isTransitioning && activeSlide === index
                            ? "400ms"
                            : "0ms",
                      }}
                    >
                      <img
                        src={slide.photo}
                        alt={slide.title || "Banner"}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop";
                        }}
                      />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Custom Navigation Buttons */}
              <div className="hidden group-hover:flex transition-all ease-linear duration-300">
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 border border-gray-400 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-lg z-10 hover:bg-white transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg sm:text-xl text-gray-700">‹</span>
                </button>
              </div>
              <div className="hidden group-hover:flex transition-all ease-linear duration-300">
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 border border-gray-400 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-lg z-10 hover:bg-white transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg sm:text-xl text-gray-700">›</span>
                </button>
              </div>

              {/* Custom Pagination */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                {bannerList.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                      activeSlide === index
                        ? "bg-white border-white"
                        : "bg-white/50 border-white/80 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <MainSliderSkeleton />
          )}

          {/* Right Side Separate Sliders */}
          <div className="flex flex-col gap-4 w-full lg:w-[435px] lg:flex-shrink-0">
            {/* Top Banner Slider */}
            {topBannerList.length > 0 ? (
              <div className="bg-white h-[200px] sm:h-[287px] relative rounded-lg overflow-hidden shadow-lg">
                <div className="relative w-full h-full">
                  {topBannerList.map((slide, index) => (
                    <Link
                      key={slide._id}
                      to={getInternalPath(slide.link)}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                        topBannerSlide === index ? "opacity-100" : "opacity-0"
                      } ${
                        topBannerSlide === index
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                    >
                      <img
                        src={slide.photo}
                        alt={slide.title || "Top Banner"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=435&h=287&fit=crop";
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <SideBannerSkeleton label="No Top Banner" />
            )}

            {/* Bottom Banner Slider */}
            {bottomBannerList.length > 0 ? (
              <div className="bg-white h-[200px] sm:h-[287px] relative rounded-lg overflow-hidden shadow-lg">
                <div className="relative w-full h-full">
                  {bottomBannerList.map((slide, index) => (
                    <Link
                      key={slide._id}
                      to={getInternalPath(slide.link)}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                        bottomBannerSlide === index
                          ? "opacity-100"
                          : "opacity-0"
                      } ${
                        bottomBannerSlide === index
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                    >
                      <img
                        src={slide.photo}
                        alt={slide.title || "Bottom Banner"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=435&h=287&fit=crop";
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <SideBannerSkeleton label="No Bottom Banner" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}