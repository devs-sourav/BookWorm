import React, { useEffect, useState, useRef } from "react";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { menusList, socialList } from "../../constants";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import logo from "../../../assets/logos/logowhite.png";
import logo1 from "../../../assets/logos/logo.png";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { deleteFromCart } from "../../../redux/slices/cartSlices";
import { logout } from "../../../redux/slices/authSlice";
import Search from "./Search";
import { MdKeyboardArrowRight, MdOutlineClose } from "react-icons/md";
import MobileSearch from "./MobileSearch";
import { TiArrowBackOutline } from "react-icons/ti";
import { PiPercentBold } from "react-icons/pi";
import {
  ShoppingCart,
  User,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  Heart,
  Package,
  Shield,
  Crown,
  ChevronUp,
} from "lucide-react";

const Navbar = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCart, setIsOpenCart] = useState(false);
  const [categoryActive, setCategoryActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Scroll-related states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const navbarRef = useRef(null);

  // Redux selectors
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  // Enhanced scroll handler with smooth transitions
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;

      // Determine scroll direction
      const scrollingUp = currentScrollY < lastScrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      // Update scroll states
      setIsScrolled(currentScrollY > 20);
      setIsScrollingUp(scrollingUp || currentScrollY < scrollThreshold);
      setShowScrollTop(currentScrollY > 400);
      setLastScrollY(currentScrollY);

      // Close user menu when scrolling
      if (Math.abs(currentScrollY - lastScrollY) > 50 && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    // Throttled scroll handler for better performance
    let ticking = false;
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [lastScrollY, isUserMenuOpen]);

  // Get navbar height for proper spacing
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleDrawer1 = () => {
    setIsOpenCart((prevState) => !prevState);
  };

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://bookwormm.netlify.app/api/v1/category"
        );
        setCategories(response.data.data.doc);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Updated helper functions to match cart slice
  const handleDelete = (_id) => {
    dispatch(deleteFromCart({ _id }));
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => {
        let finalPrice = item.price;

        // Calculate discount based on discountType
        if (item.discountType && item.discountValue > 0) {
          if (item.discountType === "percent") {
            // Percentage discount
            const discountAmount = (item.price * item.discountValue) / 100;
            finalPrice = item.price - discountAmount;
          } else if (item.discountType === "amount") {
            // Fixed amount discount
            finalPrice = Math.max(0, item.price - item.discountValue);
          }
          // If discountType is 'none', use original price
        }

        return total + item.quantity * Math.ceil(finalPrice);
      }, 0)
      .toFixed(0);
  };

  const setHandleClick = async (id) => {
    try {
      const response = await axios.get(
        `https://bookwormm.netlify.app/api/v1/category/${id}`
      );
      setData(response.data.data.doc);
      setCategoryActive(!categoryActive);
    } catch (err) {
      console.error("Error fetching category data:", err);
    }
  };

  // User helper functions
  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return (
      user.name ||
      user.firstName ||
      user.username ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserAvatar = () => {
    return user?.avatar || user?.profilePicture || user?.photo || null;
  };

  const getUserRole = () => {
    return user?.role || "customer";
  };

  const formatRole = (role) => {
    const roleMap = {
      admin: "Administrator",
      author: "Author",
      customer: "Customer",
      vendor: "Vendor",
      user: "User",
    };
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "author":
        return <Crown className="w-3 h-3" />;
      case "vendor":
        return <Package className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const handleProfileNavigation = () => {
    const roleBasedPath = user?.role === "author" ? "author" : "general";
    navigate(`/profile/${roleBasedPath}/${user?._id}`);
    setIsUserMenuOpen(false);
  };
  const handleProfileNavigationOrder = () => {
    const roleBasedPath = user?.role === "author" ? "author" : "general";
    navigate(`/profile/${roleBasedPath}/${user?._id}#order_details_user`);
    setIsUserMenuOpen(false);
  };

  // Create navbar classes based on scroll state
  const getNavbarClasses = () => {
    let classes =
      "mx-auto text-white font-inter shadow-sm transition-all duration-300 ease-in-out ";

    if (isScrolled) {
      classes +=
        "fixed top-0 left-0 right-0 z-40 bg-[#252F3D]/95 backdrop-blur-md border-b border-gray-700/30 ";
      if (isScrollingUp) {
        classes += "transform translate-y-0 ";
      } else {
        classes += "transform -translate-y-full ";
      }
      classes += "py-2 shadow-lg ";
    } else {
      classes += "bg-[#252F3D] py-3 ";
    }

    return classes;
  };

  const getSecondaryNavClasses = () => {
    let classes = "transition-all duration-300 ease-in-out ";

    if (isScrolled) {
      if (isScrollingUp) {
        classes +=
          "fixed top-[60px] left-0 right-0 z-30 bg-[#1E2631]/95 backdrop-blur-md border-b border-gray-600/20 ";
      } else {
        classes +=
          "fixed top-0 left-0 right-0 z-30 bg-[#1E2631]/95 backdrop-blur-md transform -translate-y-full ";
      }
    } else {
      classes += "bg-[#1E2631] ";
    }

    return classes;
  };

  return (
    <>
      {/* Spacer div to prevent content jump when navbar becomes fixed */}
      {isScrolled && (
        <div
          style={{ height: `${navbarHeight + 40}px` }}
          className="transition-all duration-300"
        />
      )}

      {/* Mobile Menu Drawer */}
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        size={windowWidth > 400 ? 400 : 300}
        lockBackgroundScroll={true}
        className="bla bla bla"
      >
        <div className="font-inter h-screen overflow-scroll">
          <div className="py-4 px-7 flex justify-between items-center">
            <Link className="flex  items-baseline" to={"/"}>
              <div className="mb-2 w-32">
                <img className="w-full" src={logo1} alt="Logo" />
              </div>
            </Link>
            <div onClick={() => toggleDrawer()}>
              <MdOutlineClose className="text-xl text-texthead cursor-pointer" />
            </div>
          </div>
          <div className="px-7">
            <MobileSearch toggleDrawer={toggleDrawer} />
          </div>

          {/* Mobile User Section */}
          {isAuthenticated && user ? (
            <div className="border-t border-t-border md:hidden py-4 px-7">
              <div className="flex items-center space-x-3 mb-4">
                {getUserAvatar() ? (
                  <img
                    src={getUserAvatar()}
                    alt={getUserDisplayName()}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-texthead">
                    {getUserDisplayName()}
                  </p>
                  <div className="flex !text-gray-600 items-center space-x-1">
                    {getRoleIcon(getUserRole())}
                    <p className="text-sm text-gray-600">
                      {formatRole(getUserRole())}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleProfileNavigation}
                  className="flex items-center w-full px-3 py-2 text-sm text-texthead hover:bg-bestdealbg rounded-md transition-colors duration-150"
                >
                  <UserCircle className="w-4 h-4 mr-3" />
                  My Profile
                </button>
                {/* <Link
                  to="/wishlist"
                  onClick={() => toggleDrawer()}
                  className="flex items-center w-full px-3 py-2 text-sm text-texthead hover:bg-bestdealbg rounded-md transition-colors duration-150"
                >
                  <Heart className="w-4 h-4 mr-3" />
                  Wishlist
                </Link> */}
                {/* <button
                  onClick={handleProfileNavigationOrder}
                  className="flex items-center w-full px-3 py-2 text-sm text-texthead hover:bg-bestdealbg rounded-md transition-colors duration-150"
                >
                  <Package className="w-4 h-4 mr-3" />
                  My Orders
                </button> */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t md:hidden border-t-border py-4 px-7">
              <Link
                to="/login"
                onClick={() => toggleDrawer()}
                className="flex items-center justify-center w-full py-3 px-4 bg-texthead text-white rounded-md hover:bg-opacity-90 transition-colors duration-150"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </div>
          )}

          <div className="border-t border-t-border py-7 block sm:hidden">
            <h2 className="text-lg font-medium text-texthead flex items-center justify-between pb-5 px-7">
              Menu
              <MdOutlineClose
                onClick={() => toggleDrawer()}
                className="text-xl cursor-pointer"
              />
            </h2>
            <ul className="flex flex-col">
              {menusList.map((item, index) => (
                <li key={index}>
                  <Link
                    className="py-3 px-8 block transition-all ease-linear duration-200 hover:bg-bestdealbg text-base font-medium text-texthead"
                    onClick={() => toggleDrawer()}
                    to={item?.link}
                  >
                    {item?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Section */}
          <div className="border-t border-t-border">
            <ul className="flex flex-col min-h-[500px] relative overflow-hidden">
              {categories.map((category) => (
                <li
                  className="py-3.5 px-7 cursor-pointer hover:bg-bestdealbg transition-all ease-linear duration-300 flex items-center justify-between"
                  key={category._id}
                  onClick={() => setHandleClick(category._id)}
                >
                  <h4 className="text-base font-medium text-texthead">
                    {category?.title}
                  </h4>
                  <h4>
                    <MdKeyboardArrowRight className="text-xl" />
                  </h4>
                </li>
              ))}
              <li
                className={`absolute ${
                  categoryActive ? "left-0" : "left-full"
                } transition-all duration-300 ease-in-out top-0 w-full min-h-[500px] bg-white z-20`}
              >
                <div>
                  <div className="">
                    <h4
                      onClick={() => setCategoryActive(false)}
                      className="font-medium py-3.5 px-7 text-base text-texthead flex gap-x-2 items-center cursor-pointer bg-bestdealbg"
                    >
                      <span>
                        <MdKeyboardArrowRight className="text-xl rotate-180" />
                      </span>
                      {data?.title}
                    </h4>
                    <ul className="mt-3">
                      {data?.subCategories?.map((item, index) => {
                        return (
                          <li
                            className="hover:bg-bestdealbg hover:bg-opacity-60 transition-all ease-linear duration-200"
                            key={index}
                          >
                            <Link
                              onClick={() => {
                                toggleDrawer();
                                setCategoryActive(false);
                              }}
                              className="py-3.5 px-9 inline-block"
                              to={`/shop/subcategory/${item?._id}`}
                            >
                              {item?.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="border-t flex justify-center border-t-border px-5">
            <ul className="flex items-center flex-wrap gap-5 py-7">
              {socialList.map((item, index) => {
                const Icon = item?.logo;
                return (
                  <li key={index}>
                    <Link
                      className="flex items-center justify-center w-10 h-10 border border-border rounded-md hover:bg-danger text-texthead transition-all ease-linear duration-200 hover:text-white"
                      to={item?.link}
                    >
                      <Icon />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Drawer>

      <nav ref={navbarRef} className={getNavbarClasses()}>
        <div className="flex container items-center justify-between">
          <div className="flex items-center gap-x-10 xl:gap-x-16">
            <div className="flex gap-x-8 items-center">
              <div onClick={toggleDrawer}>
                <HiOutlineMenuAlt1 className="text-3xl text-white cursor-pointer hover:scale-110 transition-transform duration-200" />
              </div>
              <div>
                <Link className="flex items-baseline" to={"/"}>
                  <div
                    className={`mb-2 transition-all duration-300 ${
                      isScrolled ? "w-40" : "w-48"
                    }`}
                  >
                    <img className="w-full" src={logo} alt="Logo" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-10 xl:gap-x-10">
            <Search />
            <div className="flex items-center space-x-6">
              {/* Account Section */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated && user ? (
                  // Authenticated User
                  <div
                    className="flex items-center space-x-3 cursor-pointer hover:bg-[#1E2631] rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {/* User Avatar */}
                    <div className="relative">
                      {getUserAvatar() ? (
                        <img
                          src={getUserAvatar()}
                          alt={getUserDisplayName()}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {getUserDisplayName().charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Online status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                    </div>

                    {/* User Info */}
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {getUserDisplayName()}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(getUserRole())}
                        <p className="text-xs text-gray-300 leading-tight">
                          {formatRole(getUserRole())}
                        </p>
                      </div>
                    </div>

                    {/* Dropdown Arrow */}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                ) : (
                  // Guest User
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 hover:bg-[#1E2631] rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-300">Sign In</p>
                      <p className="text-sm font-semibold text-white">
                        My Account
                      </p>
                    </div>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                {isAuthenticated && user && isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {getUserAvatar() ? (
                          <img
                            src={getUserAvatar()}
                            alt={getUserDisplayName()}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {getUserDisplayName().charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {getUserDisplayName()}
                          </p>
                          <div className="flex text-gray-500 items-center space-x-1">
                            {getRoleIcon(getUserRole())}
                            <p className="text-xs text-gray-500">
                              {formatRole(getUserRole())}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfileNavigation}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <UserCircle className="w-4 h-4 mr-3 text-gray-500" />
                        Profile
                      </button>
                      {/* <button
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        onClick={handleProfileNavigationOrder}
                      >
                        <Package className="w-4 h-4 mr-3 text-gray-500" />
                        My Orders
                      </button>

                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        Settings
                      </Link> */}

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              {/* {isAuthenticated && user && ( */}
                <div>
                  <Link to="/cart">
                    <div className="flex items-center space-x-2 hover:bg-[#1E2631] rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105">
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        {totalQuantity > 0 && (
                          <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-[5px] min-w-[18px] h-[18px] flex items-center justify-center font-semibold animate-bounce">
                            {totalQuantity}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-300">My Cart</p>
                        <p className="text-sm font-semibold text-white">
                          <FaBangladeshiTakaSign className="inline" />{" "}
                          {calculateSubtotal()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
               {/* )} */}
            </div>

            {/* Mobile Cart Icon */}
            {/* Mobile Cart Icon */}
            {/* {isAuthenticated && user && ( */}
              <Link
                to={"/cart"}
                className="relative cursor-pointer inline-block sm:hidden hover:scale-110 transition-transform duration-200"
              >
                <div>
                  <HiOutlineShoppingBag className="text-3xl cursor-pointer" />
                </div>
                {totalQuantity > 0 && (
                  <h3 className="text-xs text-white bg-red-500 px-2 rounded-full py-1 absolute left-3 -top-2 cursor-pointer animate-bounce">
                    {totalQuantity}
                  </h3>
                )}
              </Link>
            {/* )} */}
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className={getSecondaryNavClasses()}>
        <div className="container text-white">
          <ul className="hidden sm:flex items-center gap-x-7 py-2 xl:gap-x-6">
            {menusList.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    isActive
                      ? "text-danger font-normal text-[14px] border-b-2 border-danger pb-2"
                      : "font-normal text-[14px] hover:text-danger transition-all duration-200 pb-2 hover:border-b-2 hover:border-danger/50"
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#252F3D] hover:bg-[#1E2631] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#252F3D] animate-fadeIn"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 mx-auto" />
        </button>
      )}
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Smooth scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Loading animation for navbar */
        .navbar-loading {
          background: linear-gradient(
            90deg,
            #252f3d 25%,
            #1e2631 50%,
            #252f3d 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Enhanced hover effects */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        /* Gradient text effect */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Backdrop blur enhancement */
        .backdrop-blur-enhanced {
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
        }

        /* Smooth border animations */
        .border-animate {
          position: relative;
          overflow: hidden;
        }

        .border-animate::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
          transition: left 0.5s;
        }

        .border-animate:hover::before {
          left: 100%;
        }

        /* Pulse animation for notifications */
        .pulse-notification {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Smooth transitions for mobile menu */
        .drawer-transition {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus states for accessibility */
        .focus-enhanced:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.5);
          border-radius: 6px;
        }

        /* Smooth cart quantity animation */
        .cart-quantity {
          animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
