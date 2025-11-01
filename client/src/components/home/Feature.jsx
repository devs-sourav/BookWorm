import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import { Link, useNavigate } from "react-router-dom";
import TitleHead from "../titlehead/TitleHead";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaBook, FaGlobe, FaRocket, FaGhost } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import ApiContext from "../baseapi/BaseApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

const Feature = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseApi = useContext(ApiContext);

  // Default category styling with professional color schemes
  const defaultCategoryStyles = {
    'Bangladesh': {
      bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconColor: '#ffffff',
      icon: <FaGlobe />,
      description: 'Explore local content'
    },
    'Horror': {
      bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      iconColor: '#ffffff',
      icon: <FaGhost />,
      description: 'Spine-chilling stories'
    },
    'Science Fiction': {
      bgColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      iconColor: '#ffffff',
      icon: <FaRocket />,
      description: 'Future adventures'
    },
    'Science Fictionss': {
      bgColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      iconColor: '#ffffff',
      icon: <FaRocket />,
      description: 'Sci-fi collections'
    }
  };

  // Fallback colors for categories not in the default list
  const fallbackColors = [
    { bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', iconColor: '#ffffff' },
    { bgColor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', iconColor: '#ffffff' },
    { bgColor: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', iconColor: '#ffffff' },
    { bgColor: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', iconColor: '#ffffff' },
    { bgColor: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', iconColor: '#ffffff' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseApi}/category`);
        const apiCategories = response.data.data.doc;

        // Enhance categories with styling and additional info
        const enhancedCategories = apiCategories.map((category, index) => {
          const defaultStyle = defaultCategoryStyles[category.title] || 
                              fallbackColors[index % fallbackColors.length];
          
          return {
            ...category,
            bgColor: defaultStyle.bgColor,
            iconColor: defaultStyle.iconColor,
            icon: defaultCategoryStyles[category.title]?.icon || <BiCategory />,
            description: defaultCategoryStyles[category.title]?.description || 'Discover amazing content',
            subcategoryCount: category.subCategories?.length || 0
          };
        });

        setCategories(enhancedCategories);
      } catch (error) {
        setError("Unable to load categories. Please try again later.");
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [baseApi]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/shop/category/${categoryId}`);
  };

  // Loading component
  const LoadingCard = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-48 w-full"></div>
    </div>
  );

  // Error component
  if (error) {
    return (
      <section className="pt-14 lg:pt-28 font-inter">
        <Containar>
          <div className="flex flex-col items-center justify-center py-12">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <p className="text-gray-600 text-center">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </Containar>
      </section>
    );
  }

  return (
    <section className="pt-14 lg:pt-28 font-inter">
      <Containar>
        <TitleHead 
          titile="Featured Categories" 
          subtitle="Explore Our Collections" 
        />
        
        {/* Desktop/Tablet View */}
        <div className="hidden sm:block">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
                {[...Array(5)].map((_, index) => (
                  <LoadingCard key={index} />
                ))}
              </div>
            ) : (
              <Swiper
                spaceBetween={20}
                slidesPerView={1}
                loop={categories.length > 3}
                speed={1000}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                  1280: { slidesPerView: 5 },
                }}
                autoplay={{ 
                  delay: 4000,
                  disableOnInteraction: false 
                }}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true 
                }}
                navigation
                modules={[Autoplay, Navigation, Pagination]}
                className="mySwiper mt-10 pb-12"
              >
                {categories.map((category, index) => (
                  <SwiperSlide key={category._id}>
                    <motion.div
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="group cursor-pointer"
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      <div 
                        className="relative overflow-hidden rounded-xl p-8 h-48 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{ background: category.bgColor }}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white"></div>
                          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <div 
                            className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300"
                            style={{ color: category.iconColor }}
                          >
                            {category.icon}
                          </div>
                          
                          <h3 
                            className="text-lg font-bold mb-2 group-hover:translate-y-[-2px] transition-transform duration-300"
                            style={{ color: category.iconColor }}
                          >
                            {category.title}
                          </h3>
                          
                          <p 
                            className="text-sm opacity-90 mb-2"
                            style={{ color: category.iconColor }}
                          >
                            {category.description}
                          </p>
                          
                          {category.subcategoryCount > 0 && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-20 backdrop-blur-sm"
                              style={{ color: category.iconColor }}
                            >
                              {category.subcategoryCount} subcategories
                            </span>
                          )}
                        </div>
                        
                        {/* Hover Effect Arrow */}
                        <div 
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                          style={{ color: category.iconColor }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-10"
          >
            {loading ? (
              <div className="flex gap-4 overflow-x-scroll pb-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="min-w-[280px]">
                    <LoadingCard />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                {categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    whileTap={{ scale: 0.95 }}
                    className="min-w-[280px] cursor-pointer group"
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div 
                      className="relative overflow-hidden rounded-xl p-6 h-44 flex flex-col justify-between shadow-lg active:shadow-xl transition-all duration-300"
                      style={{ background: category.bgColor }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white"></div>
                        <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div 
                          className="text-3xl mb-3"
                          style={{ color: category.iconColor }}
                        >
                          {category.icon}
                        </div>
                        
                        <h3 
                          className="text-lg font-bold mb-2"
                          style={{ color: category.iconColor }}
                        >
                          {category.title}
                        </h3>
                        
                        <p 
                          className="text-sm opacity-90 mb-2"
                          style={{ color: category.iconColor }}
                        >
                          {category.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          {category.subcategoryCount > 0 && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-20 backdrop-blur-sm"
                              style={{ color: category.iconColor }}
                            >
                              {category.subcategoryCount} items
                            </span>
                          )}
                          
                          <span 
                            className="text-sm font-medium"
                            style={{ color: category.iconColor }}
                          >
                            Explore →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Containar>

      {/* Custom CSS for scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Feature;