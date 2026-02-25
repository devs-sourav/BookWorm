import React, { useEffect, useRef, useState } from "react";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { menusList, socialList } from "../../constants";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import logo from "../../../assets/logos/logoblack.png";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import product1 from "../../../assets/bestsell/bestsell1.jpg";
import { useDispatch, useSelector } from "react-redux";
import { deleteFromCart } from "../../../redux/slices/cartSlices";
import Search from "./Search";
import { MdKeyboardArrowRight, MdOutlineClose } from "react-icons/md";
import MobileSearch from "./MobileSearch";
import { TiArrowBackOutline } from "react-icons/ti";
import { PiPercentBold } from "react-icons/pi";
import { BiRightArrow } from "react-icons/bi";
import {
  Menu,
  Search as SearchIcon,
  User,
  ShoppingCart,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import DesktopSearch from "./DesktopSearch";

// Container component for consistent layout
const Container = ({ children }) => (
  <div className="container mx-auto px-4">{children}</div>
);

export default function HeadNavbar() {
  // State from original Navbar
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCart, setIsOpenCart] = useState(false);
  const [categoryActive, setCategoryActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({});

  // State from HeadNavbar
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0.0);
  const [searchValue, setSearchValue] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Refs
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);

  // Mock auth state with more comprehensive user data
  const [authState, setAuthState] = useState({
    user: {
      name: "John Doe",
      firstName: "John",
      username: "johndoe",
      role: "author",
      _id: "123456",
      avatar: null,
      profileImage: null,
    },
    isAuthenticated: true,
  });

  const { user, isAuthenticated } = authState;

  // Navigation items with their respective paths
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Author", path: "/author" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
    { name: "About us", path: "/about" },
  ];

  // Window resize effect
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  // Fetch categories effect
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://bookwormm.netlify.app/api/v1/category"
        );
        setCategories(response.data.data.doc);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter products effect
  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  // Update cart totals when cartItems change
  useEffect(() => {
    const totalQuantity = cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const totalAmount = cartItems.reduce(
      (total, item) =>
        total +
        item?.quantity *
          (item?.priceAfterDiscount > 0
            ? Math.ceil(item?.priceAfterDiscount)
            : item?.price),
      0
    );
    setCartCount(totalQuantity);
    setCartTotal(totalAmount);
  }, [cartItems]);

  // Drawer functions
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const toggleDrawer1 = () => {
    setIsOpenCart((prevState) => !prevState);
  };

  // Function to check if a nav item is active
  const isActiveNavItem = (path) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    setCurrentPath(path);
    console.log("Navigating to:", path);
  };

  // Handle user logout
  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    setIsUserMenuOpen(false);
    console.log("User logged out");
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "";
    return user.name || user.firstName || user.username || "User";
  };

  // Get user role display
  const getUserRole = () => {
    if (!user) return "";
    return user.role || "Member";
  };

  // Get user avatar
  const getUserAvatar = () => {
    return user?.avatar || user?.profileImage || null;
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return "Member";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Handle search functionality
  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && searchValue.trim()) {
      console.log("Searching for:", searchValue);
      setIsSearchOpen(false);
      setSearchValue("");
    }
  };

  // Demo function to toggle authentication state
  const toggleAuthState = () => {
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: !prev.isAuthenticated,
      user: prev.isAuthenticated
        ? null
        : {
            name: "John Doe",
            firstName: "John",
            username: "johndoe",
            role: "author",
            _id: "123456",
            avatar: null,
            profileImage: null,
          },
    }));
  };

  // Category handling
  const setHandleClick = async (id) => {
    try {
      const response = await axios.get(
        `https://bookwormm.netlify.app/api/v1/category/${id}`
      );
      setData(response.data.data.doc);
      setCategoryActive(!categoryActive);
    } catch (err) {
      console.error("Error fetching category:", err);
    }
  };

  // Cart functions
  const handleDelete = (id) => {
    dispatch(deleteFromCart({ id }));
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce(
        (total, item) =>
          total +
          item?.quantity *
            (item?.priceAfterDiscount > 0
              ? Math.ceil(item?.priceAfterDiscount)
              : item?.price),
        0
      )
      .toFixed(0);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isSearchOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, isUserMenuOpen]);

  return (
    <div>
      {/* Mobile Menu Drawer */}
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        size={windowWidth > 400 ? 400 : 300}
        lockBackgroundScroll={true}
        className="bla bla bla"
      >
        <div className="font-inter h-screen overflow-scroll ">
          <div className="py-4 px-7 flex justify-between items-center">
            <Link className="flex items-baseline" to={"/"}>
              <div className="mb-2 w-5 xl:w-7 ">
                <img className="w-full " src={logo} />
              </div>
              <h4 className="text-2xl italic">
                e<span className="text-danger">v</span>en
              </h4>
            </Link>
            <div onClick={() => toggleDrawer()}>
              <MdOutlineClose className="text-xl text-texthead cursor-pointer " />
            </div>
          </div>
          <div className="px-7">
            <MobileSearch toggleDrawer={toggleDrawer} />
          </div>
          <div className="border-t  border-t-border py-7 block sm:hidden">
            <h2 className="text-lg font-medium  text-texthead flex items-center justify-between  pb-5 px-7">
              Menu
              <MdOutlineClose
                onClick={() => toggleDrawer()}
                className="text-xl cursor-pointer"
              />
            </h2>
            <ul className=" flex flex-col">
              {menusList.map((item, index) => (
                <li key={index}>
                  <Link
                    className="py-3 px-8 block transition-all ease-linear duration-200 hover:bg-bestdealbg text-base font-medium  text-texthead "
                    onClick={() => toggleDrawer()}
                    to={item?.link}
                  >
                    {item?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-t-border ">
            <h2 className="text-lg font-medium text-texthead  items-center justify-between hidden  pb-5 ">
              Categories
            </h2>
            <ul className=" flex  flex-col min-h-[500px] relative overflow-hidden">
              {categories.map((category) => (
                <li
                  className="py-3.5 px-7 cursor-pointer hover:bg-bestdealbg transition-all ease-linear duration-300 flex items-center justify-between "
                  key={category._id}
                  onClick={() => setHandleClick(category._id)}
                >
                  <h4 className="text-base font-medium  text-texthead ">
                    {category?.title}
                  </h4>
                  <h4>
                    <MdKeyboardArrowRight className="text-xl" />
                  </h4>
                </li>
              ))}
              <li
                className={`absolute ${
                  categoryActive ? "left-0" : "left-full "
                }   transition-all duration-300 ease-in-out top-0 w-full min-h-[500px] bg-white z-20`}
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
                      {data?.subCategory?.map((item, index) => {
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
                              className="py-3.5 px-9 inline-block "
                              to={`/shop/subCategory/${item?._id}`}
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
          <div className=" border-t flex justify-center border-t-border px-5">
            <ul className="flex items-center flex-wrap gap-5 py-7 ">
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

      {/* Cart Drawer */}
      <Drawer
        open={isOpenCart}
        onClose={toggleDrawer1}
        direction="right"
        className="bla bla bla"
        size={600}
      >
        <div className="font-inter max-h-screen overflow-y-scroll">
          <div className="flex justify-between items-center py-6 px-10 border-b border-b-border">
            <div className="flex items-center gap-x-5 ">
              <HiOutlineShoppingBag className="text-2xl" />
              <h3 className="text-base font-medium">
                Your shopping bag ({cartItems.length})
              </h3>
            </div>
            <div
              onClick={() => {
                toggleDrawer1();
              }}
              className="flex gap-x-2 items-center cursor-pointer group "
            >
              <h3 className="text-gray-600 group-hover:text-danger transition-all ease-linear duration-200 font-medium text-base">
                Close
              </h3>
              <IoClose className="text-gray-700 text-2xl group-hover:text-danger transition-all ease-linear duration-200 " />
            </div>
          </div>
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => {
                const salePrice = item?.priceAfterDiscount;
                return (
                  <div
                    key={item._id}
                    className="px-10 py-7 flex justify-between border-b border-b-border"
                  >
                    <div className=" flex gap-x-5">
                      <div className="w-[120px] h-[150px] relative">
                        <Link
                          to={`/productdetail/${item._id}`}
                          onClick={() => toggleDrawer1()}
                          className="w-full h-full"
                        >
                          <img
                            className="w-full h-full object-cover"
                            src={item?.photos[0]}
                            alt={item.name}
                          />
                        </Link>
                        {item?.priceAfterDiscount > 0 && (
                          <p className="text-xs cursor-pointer absolute right-2 -top-0.5 mt-2 px-2 text-white rounded-md py-0.5 bg-danger inline-block">
                            {item?.discount > 0 ? (
                              <span className="flex font-bold items-center gap-x-0.5">
                                <FaBangladeshiTakaSign />
                                {item?.discount}
                              </span>
                            ) : (
                              item?.discountPercent > 0 && (
                                <span className="flex font-bold items-center gap-x-0.5">
                                  {item?.discountPercent} <PiPercentBold />
                                </span>
                              )
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <h4
                          onClick={() => {
                            toggleDrawer1();
                            navigate(`/shop/brand/${item?.product?._id}`);
                          }}
                          className="text-xs uppercase mt-2 mb-2 cursor-pointer"
                        >
                          {item?.product?.title}
                        </h4>

                        <Link
                          to={`/productdetail/${item?._id}`}
                          onClick={() => toggleDrawer1()}
                          className="text-base font-medium cursor-pointer hover:text-danger transition-all ease-linear duration-200"
                        >
                          {item?.title}
                        </Link>
                        {item?.userChoiceColor &&
                        item?.userChoiceColor.length > 0 ? (
                          <p className="text-sm mt-3 font-normal capitalize">
                            <span className="mr-2">Color:</span>
                            {item?.userChoiceColor}
                          </p>
                        ) : (
                          <p className="text-sm mt-3 font-normal ">
                            <Link
                              onClick={() => {
                                toggleDrawer1();
                              }}
                              to={`/shop/category/${item?.product?.category?._id}`}
                            >
                              {item?.product?.category?.title}
                            </Link>
                          </p>
                        )}
                        <p className=" mt-2 flex items-center gap-x-1 text-xs">
                          {item?.quantity} ×{" "}
                          {item?.priceAfterDiscount > 0 ? (
                            <span className="flex items-center gap-x-2 text-xs text-texthead">
                              <span className="flex items-center gap-x-0.5">
                                {" "}
                                <FaBangladeshiTakaSign />
                                {Math.ceil(salePrice)}
                              </span>
                              <del className="flex items-center gap-x-0.5">
                                {" "}
                                {item?.price?.toFixed(0)}
                              </del>
                            </span>
                          ) : (
                            <span className="flex items-center gap-x-0.5 text-xs text-texthead">
                              <FaBangladeshiTakaSign />
                              {item?.price?.toFixed(0)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs mt-3 px-1 py-0.5 rounded-md bg-gray-300 text-texthead font-medium inline-block  ">
                          <span className="flex items-center gap-x-1">
                            <FaBangladeshiTakaSign />{" "}
                            {item?.priceAfterDiscount > 0
                              ? Math.ceil(item?.priceAfterDiscount) *
                                item?.quantity
                              : item?.price * item?.quantity}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="">
                      <IoClose
                        className="text-gray-700 text-2xl mt-2 group-hover:text-danger transition-all ease-linear duration-200 cursor-pointer"
                        onClick={() => handleDelete(item._id)}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between px-10 py-7">
                <h3 className="text-base font-medium">Subtotal</h3>
                <h3 className="text-base text-green-600 font-medium flex items-center gap-x-1">
                  <FaBangladeshiTakaSign /> {calculateSubtotal()}
                </h3>
              </div>
            </>
          ) : (
            <div className="px-10 py-7  text-center">
              <h2 className="text-9xl mt-10 flex justify-center">
                <HiOutlineShoppingBag />
              </h2>
              <h2 className="text-3xl mt-10">Your cart is empty</h2>
            </div>
          )}
          <div className="flex flex-col gap-y-5 px-10 py-7">
            {cartItems.length > 0 ? (
              <>
                <Link
                  onClick={toggleDrawer1}
                  className="text-base text-center rounded-sm font-medium text-texthead w-full py-5 border border-texthead hover:bg-texthead transition-all ease-linear duration-150 hover:text-white"
                  to={"/cart"}
                >
                  View Cart
                </Link>
                <Link
                  onClick={toggleDrawer1}
                  className="text-base text-center rounded-sm font-medium hover:text-texthead w-full py-5 border border-texthead bg-texthead hover:bg-white text-white transition-all ease-linear duration-150"
                  to={"/checkout"}
                >
                  Checkout
                </Link>
              </>
            ) : (
              <Link
                onClick={toggleDrawer1}
                className="text-base text-center rounded-sm font-medium text-texthead w-full py-5 border border-texthead hover:bg-texthead transition-all ease-linear duration-150 hover:text-white flex gap-x-2 justify-center items-center"
                to={"/shop"}
              >
                <div className="flex items-center gap-x-2">
                  <TiArrowBackOutline className="text-xl" />
                  Back to Shop
                </div>
              </Link>
            )}
          </div>
        </div>
      </Drawer>

      {/* Demo Controls */}
      {/* <div className="bg-yellow-100 p-2 text-center text-sm border-b">
        <button
          onClick={toggleAuthState}
          className="bg-blue-500 text-white px-3 py-1 rounded mr-4"
        >
          Toggle Auth ({isAuthenticated ? "Logged In" : "Logged Out"})
        </button>
        <span className="text-gray-600">
          Cart: {cartCount} items (৳{cartTotal.toFixed(0)})
        </span>
      </div> */}

      {/* Main Header */}
      <div className="bg-[#252F3D] text-white">
        <Container>
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Left: Menu + Logo */}
            <div className="flex items-center space-x-4">
              <Menu
                className="w-7 h-7 mt-3 cursor-pointer hover:text-gray-300 transition-colors"
                onClick={toggleDrawer}
              />
              <a
                href="/"
                className="flex items-center text-2xl font-bold hover:text-gray-200 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/");
                }}
              >
                <div className="flex items-baseline">
                  <div className="mb-2 w-7 xl:w-10 mr-2">
                    <img className="w-full" src={logo} />
                  </div>
                  <h4 className="text-3xl italic">
                    e<span className="text-red-500">v</span>en
                  </h4>
                </div>
              </a>
            </div>

            {/* Right: Search + Account + Cart */}
            <DesktopSearch
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              handleSearchEnter={handleSearchEnter}
            />
          </div>
        </Container>

        {/* Bottom Nav */}
        <div className="bg-[#1E2631] py-2 text-sm">
          <Container>
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.name}
                  className={`transition-colors duration-200 hover:text-red-400 cursor-pointer ${
                    isActiveNavItem(item.path)
                      ? "text-red-500 font-semibold"
                      : "text-white"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Container>
        </div>

        {/* Desktop Navigation - Hidden on mobile, visible on larger screens */}
      </div>

      {/* Mobile Cart Link - Only visible on small screens */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Link
          to={"/cart"}
          className="relative cursor-pointer bg-[#252F3D] text-white p-3 rounded-full shadow-lg"
        >
          <HiOutlineShoppingBag className="text-2xl" />
          <h3 className="text-xs text-white bg-red-500 px-2 rounded-full py-1 absolute -right-1 -top-1">
            {cartCount}
          </h3>
        </Link>
      </div>
    </div>
  );
}
