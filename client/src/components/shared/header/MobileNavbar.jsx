import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { deleteFromCart } from "../../../redux/slices/cartSlices";
import Search from "./Search";
import MobileSearch from "./MobileSearch";
import { MdKeyboardArrowRight, MdOutlineClose } from "react-icons/md";
import { PiPercentBold } from "react-icons/pi";
import { TiArrowBackOutline } from "react-icons/ti";

const MobileNavbar = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCart, setIsOpenCart] = useState(false);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState([]);
  const [data, setData] = useState({});
  const [categoryActive, setCategoryActive] = useState(false);
  const [isFixed, setIsFixed] = useState(false); // State for fixed navbar
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Log the width whenever it changes
    // console.log("Current window width:", windowWidth);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  const cartItems = useSelector((state) => state.cart.items);

  const toggleDrawer1 = () => {
    setIsOpenCart((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/category"
        );
        setCategories(response.data.data.doc); // Adjust this based on the structure of the API response
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get("https://fakestoreapi.com/products");
        setProducts(response.data.reverse());
      } catch (error) {
        console.error(error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  // Calculate the total quantity of items in the cart
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const setHandleClick = async (id) => {
    const response = await axios.get(
      `http://localhost:8000/api/v1/category/${id}`
    );
    setData(response.data.data.doc);
    console.log(data);
    console.log(id);
    setCategoryActive(!categoryActive);
    fetchCategoryById(id);
  };

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        size={windowWidth > 400 ? 400 : 300}
        lockBackgroundScroll={true}
        className="bla bla bla"
      >
        <div className="font-inter h-screen overflow-scroll">
          <div className="py-4 px-4 flex justify-between items-center">
            <Link className="flex items-baseline" to={"/"}>
              <div className="mb-2 w-6 xl:w-7 ">
                <img className="w-full" src={logo} />
              </div>
              <h4 className="text-3xl italic">
                e<span className="text-danger">v</span>en
              </h4>
            </Link>
            <div onClick={() => toggleDrawer()}>
              <MdOutlineClose className="text-xl text-texthead cursor-pointer mt-2" />
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
                  </Link>{" "}
                </li> // Adjust based on the structure of the category data
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
                  <h4
                    className="text-base font-medium  text-texthead "
                    // onClick={() => toggleDrawer()}
                    // to={`/shop/category/${category?._id}`}
                  >
                    {category?.title}
                  </h4>{" "}
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
                            {" "}
                            <Link
                              onClick={() => {
                                toggleDrawer();
                                setCategoryActive(false);
                              }}
                              className="py-3.5 px-9 inline-block "
                              to={`/shop/category/${item?._id}`}
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
                // console.log(salePrice)
                return (
                  <div
                    key={item._id}
                    className="px-10 py-7 flex justify-between border-b border-b-border"
                  >
                    <div className=" flex gap-x-5">
                      <div className="w-[120px] h-[150px] relative">
                        <Link
                          to={`/productdetail/${item?._id}`}
                          onClick={() => toggleDrawer1()}
                          className="w-full h-full"
                        >
                          <img
                            className="w-full h-full object-cover"
                            src={item?.photos[0]}
                            alt={item?.name}
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
                            {/* <Link
                                  to={`/shop/category/${item?.product?.category?._id}`}
                                > */}
                            <span className="mr-2">Color:</span>
                            {item?.userChoiceColor}
                            {/* </Link> */}
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
      <nav
        className={`fixed w-full bg-white z-50 font-inter transition-all duration-300 ease-in-out py-5 sm:py-0 shadow-xl ${
          isFixed ? "top-0 " : "-top-[200px] "
        } mx-auto px-4 sm:px-14   `}
      >
        <div className="flex items-center  justify-between">
          <div className="flex items-center gap-x-10 xl:gap-x-16">
            <div className="flex gap-x-8 items-center">
              <div onClick={toggleDrawer}>
                <HiOutlineMenuAlt1 className="text-3xl text-texthead cursor-pointer" />
              </div>
              <div>
                <Link className="flex items-baseline" to={"/"}>
                  <div className="mb-2 w-7 xl:w-10 ">
                    <img className="w-full" src={logo} />
                  </div>
                  <h4 className="text-3xl italic">
                    e<span className="text-danger">v</span>en
                  </h4>
                </Link>
              </div>
            </div>
            <ul className="hidden sm:flex items-center gap-x-7 xl:gap-x-10">
              {menusList.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      isActive
                        ? "text-danger font-medium text-base leading-[90px]"
                        : " font-medium text-base leading-[85px]"
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-x-10 xl:gap-x-20">
            <Search />
            <div
              onClick={toggleDrawer1}
              className="relative cursor-pointer hidden sm:inline-block"
            >
              <div>
                <HiOutlineShoppingBag className="text-3xl cursor-pointer" />
              </div>
              <h3 className="text-xs text-white bg-texthead px-2 rounded-full py-1 absolute left-3 -top-2 cursor-pointer">
                {totalQuantity}
              </h3>
            </div>
            <Link
              to={"/cart"}
              className="relative cursor-pointer inline-block sm:hidden"
            >
              <div>
                <HiOutlineShoppingBag className="text-3xl cursor-pointer" />
              </div>
              <h3 className="text-xs text-white bg-texthead px-2 rounded-full py-1 absolute left-3 -top-2 cursor-pointer">
                {totalQuantity}
              </h3>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavbar;
