import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import BradcumbShop from "../components/shop/BradcumbShop";
import { FiMinus, FiPlus, FiChevronRight } from "react-icons/fi";
import ApiContext from "../components/baseapi/BaseApi";
import { categoryList } from "../components/constants/index";
import * as Slider from "@radix-ui/react-slider";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Containar from "./Containar";
import axios from "axios";
import PriceFilter from "../components/shop/PriceFilter";
import SelectOption from "../components/shop/SelectOption";
import { IoFilter } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

const ShopLayouts = () => {
  const baseApi = useContext(ApiContext);
  const location = useLocation();
  
  // Filter toggle states
  const [categoryActive, setCategoryActive] = useState(true);
  const [brandActive, setBrandActive] = useState(true);
  const [subCategoryActive, setSubCategoryActive] = useState(true);
  const [megaSaleActive, setMegaSaleActive] = useState(true);
  
  // Data states
  const [allCategory, setAllCategory] = useState([]);
  const [allBrand, setAllBrand] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mobile drawer state
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  
  // Get active category from URL
  const getActiveCategoryId = () => {
    const pathSegments = location.pathname.split('/');
    const categoryIndex = pathSegments.indexOf('category');
    return categoryIndex !== -1 ? pathSegments[categoryIndex + 1] : null;
  };
  
  // Get active subcategory from URL
  const getActiveSubCategoryId = () => {
    const pathSegments = location.pathname.split('/');
    const subCategoryIndex = pathSegments.indexOf('subcategory');
    return subCategoryIndex !== -1 ? pathSegments[subCategoryIndex + 1] : null;
  };
  
  // Get active brand from URL
  const getActiveBrandId = () => {
    const pathSegments = location.pathname.split('/');
    const brandIndex = pathSegments.indexOf('brand');
    return brandIndex !== -1 ? pathSegments[brandIndex + 1] : null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-expand active category
  useEffect(() => {
    const activeCategoryId = getActiveCategoryId();
    if (activeCategoryId) {
      setExpandedCategories(prev => new Set([...prev, activeCategoryId]));
    }
  }, [location.pathname]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseApi}/category`);
        setAllCategory(response.data.data.doc);
      } catch (err) {
        setError(err);
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    if (baseApi) {
      fetchCategories();
    }
  }, [baseApi]);
  
  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${baseApi}/brand`);
        setAllBrand(response.data.data.doc);
      } catch (err) {
        setError(err);
        console.error("Error fetching brands:", err);
      }
    };
    if (baseApi) {
      fetchBrands();
    }
  }, [baseApi]);
  
  // Filter Components
  const MegaSaleFilter = ({ isMobile = false }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div
        onClick={() => setMegaSaleActive(!megaSaleActive)}
        className="flex justify-between cursor-pointer items-center px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100 hover:from-red-100 hover:to-orange-100 transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Special Deals
        </h3>
        <div className="text-gray-600 transition-transform duration-300" style={{ transform: megaSaleActive ? 'rotate(0deg)' : 'rotate(90deg)' }}>
          <FiMinus className="text-lg" />
        </div>
      </div>
      <div
        className={`transition-all duration-500 ease-out overflow-hidden ${
          megaSaleActive
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        {megaSaleActive && (
          <ul className="p-4 space-y-1">
            <li>
              <Link
                onClick={() => isMobile && toggleDrawer()}
                to={"/shop/mega-sale"}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  location.pathname === "/shop/mega-sale"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <span>🔥 Mega Sale</span>
                <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                onClick={() => isMobile && toggleDrawer()}
                to={"/shop/offer-sale"}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  location.pathname === "/shop/offer-sale"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <span>⚡ Flash Offers</span>
                <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                onClick={() => isMobile && toggleDrawer()}
                to={"/shop/latest-sale"}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  location.pathname === "/shop/latest-sale"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <span>✨ New Arrivals</span>
                <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );

  const CategoryFilter = ({ isMobile = false }) => {
    const activeCategoryId = getActiveCategoryId();
    const activeSubCategoryId = getActiveSubCategoryId();
   
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div
          onClick={() => setCategoryActive(!categoryActive)}
          className="flex justify-between cursor-pointer items-center px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Categories
          </h3>
          <div className="text-gray-600 transition-transform duration-300" style={{ transform: categoryActive ? 'rotate(0deg)' : 'rotate(90deg)' }}>
            <FiMinus className="text-lg" />
          </div>
        </div>
        <div
          className={`transition-all duration-500 ease-out overflow-hidden ${
            categoryActive
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          {categoryActive && (
            <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : allCategory.length > 0 ? (
                <ul className="space-y-2 ">
                  {allCategory.map((item) => {
                    const isExpanded = expandedCategories.has(item._id);
                    const hasSubCategories = item.subCategories && item.subCategories.length > 0;
                    
                    return (
                      <li key={item._id} className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="flex items-center">
                          <Link
                            onClick={() => isMobile && toggleDrawer()}
                            to={`category/${item._id}`}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                              activeCategoryId === item._id
                                ? "bg-blue-500 text-white"
                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                          >
                            {item?.title}
                          </Link>
                          {hasSubCategories && (
                            <button
                              onClick={() => toggleCategoryExpansion(item._id)}
                              className={`px-3 py-3  text-gray-500 hover:text-gray-700 transition-all duration-200 ${
                                activeCategoryId === item._id ? "text-white hover:text-blue-100" : ""
                              }`}
                            >
                              <FiChevronRight 
                                className={`text-sm transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : 'rotate-0'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        
                        {/* Subcategories */}
                        {hasSubCategories && (
                          <div
                            className={`transition-all  duration-300 ease-out overflow-hidden ${
                              isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="bg-gray-50 border-t border-gray-100">
                              <ul className="p-2 space-y-1">
                                {item.subCategories.map((subCat) => (
                                  <li key={subCat._id}>
                                    <Link
                                      onClick={() => isMobile && toggleDrawer()}
                                      to={`subcategory/${subCat._id}`}
                                      className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 group ${
                                        activeSubCategoryId === subCat._id
                                          ? "bg-blue-500 text-white shadow-sm"
                                          : "text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-current rounded-full opacity-60"></span>
                                        {subCat?.title || subCat.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unnamed'}
                                      </span>
                                      <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-2">📦</div>
                  <p className="text-sm">No categories found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const BrandFilter = ({ isMobile = false }) => {
    const activeBrandId = getActiveBrandId();
   
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div
          onClick={() => setBrandActive(!brandActive)}
          className="flex justify-between cursor-pointer items-center px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Publishers
          </h3>
          <div className="text-gray-600 transition-transform duration-300" style={{ transform: brandActive ? 'rotate(0deg)' : 'rotate(90deg)' }}>
            <FiMinus className="text-lg" />
          </div>
        </div>
        <div
          className={`transition-all duration-500 ease-out overflow-hidden ${
            brandActive
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          {brandActive && (
            <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
              {allBrand.length > 0 ? (
                <ul className="space-y-1">
                  {allBrand.map((item) => (
                    <li key={item._id}>
                      <Link
                        onClick={() => isMobile && toggleDrawer()}
                        to={`brand/${item._id}`}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          activeBrandId === item._id
                            ? "bg-green-500 text-white shadow-md"
                            : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                        }`}
                      >
                        <span>{item?.title}</span>
                        <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-2">🏷️</div>
                  <p className="text-sm">No brands found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Mobile Drawer */}
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        size={320}
        className="z-50"
      >
        <div className="w-full pt-5 mb-20 h-screen overflow-y-auto bg-gray-50">
          <div className="px-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <IoFilter className="text-blue-500" />
                Filters
              </span>
              <button
                onClick={toggleDrawer}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filter"
              >
                <MdOutlineClose className="text-xl text-gray-600" />
              </button>
            </h3>
          </div>
         
          <div className="p-4 space-y-6">
            <PriceFilter toggleDrawer={toggleDrawer} />
            <MegaSaleFilter isMobile={true} />
            <CategoryFilter isMobile={true} />
            <BrandFilter isMobile={true} />
          </div>
        </div>
      </Drawer>

      <BradcumbShop />
     
      <div>
        <Containar>
          <div className="flex flex-wrap justify-between mt-14 mb-14 gap-6">
            {/* Desktop Sidebar */}
            <div className="w-full xl:w-[300px] hidden xl:block">
              <div className="sticky top-6 space-y-6">
                <PriceFilter />
                <MegaSaleFilter />
                <CategoryFilter />
                <BrandFilter />
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full xl:flex-1 xl:ml-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-3">
                    <button
                      className="flex items-center gap-x-2 px-4 py-2 text-base font-medium text-gray-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer xl:hidden transition-all duration-200"
                      onClick={toggleDrawer}
                      aria-label="Open filters"
                    >
                      <IoFilter className="text-blue-600" />
                      <span>Filters</span>
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-full">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Showing 20 Results
                    </div>
                  </div>
                  <SelectOption />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-96">
                <Outlet />
              </div>
            </div>
          </div>
        </Containar>
      </div>
    </div>
  );
};

export default ShopLayouts;