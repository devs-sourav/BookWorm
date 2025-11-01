import React, { useState, useRef, useEffect } from "react";
import { BsCartCheck } from "react-icons/bs";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlices";
import { RiPercentLine } from "react-icons/ri";
import axios from "axios";

const ProductItem = ({
  image = [],
  product,
  discount,
  subtitle,
  title,
  categoryName,
  offerprice,
  regularprice,
  classItem,
  categoryId,
  brandId,
  discountType,
  discountPercent,
  priceAfterDiscount,
  id,
  freeShipping,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalCart, setShowModalCart] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setShowModalCart(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  // Updated to work with the actual API structure
  const handleAddToCart = () => {
    const item = {
      ...product,
      id: product._id,
      quantity: 1,
      photos: product.photos,
      name: product.title, // API uses 'title' not 'name'
      price: product.price,
      salePrice: product.salePrice,
      stock: product.stock,
      discountType: product.discountType,
      discountValue: product.discountValue,
      freeShipping: product.freeShipping,
    };

    dispatch(addToCart(item));
    setShowModal(false);
    setShowModalCart(false);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseModalCart = () => {
    setShowModalCart(false);
  };

  return (
    <div
      className={`${
        classItem ? classItem : ""
      } pb-4 sm:pb-5 border-[1px] relative bg-white hover:border-texthead group border-border  overflow-hidden`}
    >
      {discount > 0 && discountType === "amount" ? (
        <div className="absolute right-2 top-3 px-3 rounded-md py-0.5 shadow-lg text-xs bg-danger text-white flex items-center gap-x-0.5">
          <FaBangladeshiTakaSign />
          {discount}
        </div>
      ) : (
        discount > 0 &&
        discountType === "percent" && (
          <div className="absolute right-2 top-3 px-3 rounded-md py-0.5 shadow-lg text-xs bg-danger text-white flex items-center gap-x-0.5">
            {discount}
            <RiPercentLine />
          </div>
        )
      )}
      {freeShipping && (
        <div className="absolute left-2 top-3 px-2 rounded-md py-0.5 shadow-lg text-xs bg-green-600 text-white flex items-center gap-x-0.5">
          <h3>Free Shipping</h3>
        </div>
      )}

      <div className="w-full ">
        <div className="w-full px-8 pt-10 mx-auto ">
          <Link to={`/productdetail/${id}`}>
            <img
              className="w-[120px] mx-auto object-contain"
              src={image && image[0] ? image[0] : "/placeholder-image.jpg"}
              alt="product"
            />
          </Link>
        </div>
        <div className="flex justify-between px-4 sm:px-8 items-center pt-2 sm:pt-[60px] pb-1 relative bg-white">
          <button
            onClick={handleBuyNow}
            className="relative hidden  px-3 py-1 rounded-md bg-danger text-white sm:block after:absolute after:-bottom-1 after:right-0 after:content-[''] after:w-0 after:h-[1px] after:bg-danger hover:after:left-0 hover:after:w-full after:transition-all after:ease-linear after:duration-200 cursor-pointer"
          >
            Buy Now
          </button>
          <h4
            onClick={handleAddToCart}
            className="w-8 hidden h-8 sm:flex justify-center items-center cursor-pointer hover:text-white transition-all ease-linear duration-200 text-texthead hover:bg-danger rounded-full"
          >
            <BsCartCheck className="text-base" />
          </h4>
          <div className="sm:absolute hidden sm:block left-0 px-4 sm:px-8 top-0 w-full h-[100px] pt-2 pb-1 group-hover:-top-[52px] transition-all ease-linear duration-200 bg-white">
            <ul>
              <li>
                <Link
                  to={`/shop/brand/${brandId}`}
                  className="uppercase inline-block text-xs text-danger mt-2"
                >
                  {subtitle}
                </Link>
              </li>
              <li>
                <Link
                  to={`/productdetail/${id}`}
                  className="text-sm leading-5 inline-block font-medium text-texthead mt-1 text-ellipsis overflow-hidden break-words"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }}
                >
                  {title}
                </Link>
              </li>
            </ul>

            <p className="text-base mt-1 text-texthead flex items-baseline gap-x-2">
              <span className="flex items-center gap-x-0.5">
                <FaBangladeshiTakaSign className="text-sm" />
                {priceAfterDiscount && priceAfterDiscount > 0
                  ? Math.ceil(priceAfterDiscount)
                  : regularprice}
              </span>
              {priceAfterDiscount && priceAfterDiscount > 0 && priceAfterDiscount < regularprice && (
                <span className="text-xs flex items-center gap-x-0.5 line-through text-gray-600">
                  <FaBangladeshiTakaSign className="text-xs" />
                  {regularprice}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="sm:hidden left-0 px-4 sm:px-8 top-0 w-full h-[120px] z-20 pt-2 pb-1 group-hover:-top-[52px] transition-all ease-linear duration-200 bg-white">
          <Link
            to={`/shop/brand/${brandId}`}
            className="uppercase block text-xs text-danger mt-2"
          >
            {subtitle}
          </Link>
          <Link
            to={`/productdetail/${id}`}
            className="text-sm leading-5 block font-medium text-texthead mt-2 text-ellipsis overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {title}
          </Link>

          <Link
            to={`/shop/category/${categoryId}`}
            className="text-xs block font-medium mt-1 hover:text-danger transition-all ease-linear duration-200 text-textgray"
          >
            {categoryName}
          </Link>
          <p className="text-base mt-1 text-texthead flex items-baseline gap-x-2">
            <span className="flex items-center gap-x-0.5">
              <FaBangladeshiTakaSign className="text-sm" />
              {priceAfterDiscount && priceAfterDiscount > 0 ? priceAfterDiscount : regularprice}
            </span>
            {priceAfterDiscount && priceAfterDiscount > 0 && priceAfterDiscount < regularprice && (
              <span className="text-xs flex items-center gap-x-0.5 line-through text-gray-600">
                <FaBangladeshiTakaSign className="text-xs" />
                {regularprice}
              </span>
            )}
          </p>
          <div className="flex sm:hidden justify-between items-center mt-2">
            <button
              onClick={handleBuyNow}
              className="relative px-3 py-0.5 rounded-md bg-danger text-white block after:absolute after:-bottom-1 after:right-0 after:content-[''] after:w-0 after:h-[1px] after:bg-danger hover:after:left-0 hover:after:w-full after:transition-all after:ease-linear after:duration-200 cursor-pointer text-base"
            >
              Buy Now
            </button>
            <h4
              onClick={handleAddToCart}
              className="w-8 h-8 flex justify-center items-center cursor-pointer hover:text-white transition-all ease-linear duration-200 text-texthead hover:bg-danger rounded-full"
            >
              <BsCartCheck className="text-base" />
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;