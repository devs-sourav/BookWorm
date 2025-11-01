import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { TiArrowBackOutline } from "react-icons/ti";
import { Trash2, Plus, Minus } from "lucide-react";
import { deleteFromCart, incrementQuantity, decrementQuantity } from '../../redux/slices/cartSlices';
import { Link, useNavigate } from "react-router-dom";

const FixedCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state) => state.auth); // ✅ auth state

  // 👉 if no user logged in, hide cart completely
  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleDrawer = () => setIsOpen(!isOpen);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
    return total + (price * item.quantity);
  }, 0);

  const handleDelete = (itemId) => dispatch(deleteFromCart({ _id: itemId }));
  const handleIncrement = (itemId) => dispatch(incrementQuantity({ _id: itemId }));
  const handleDecrement = (itemId) => dispatch(decrementQuantity({ _id: itemId }));

  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => {
      const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
      return total + (price * item.quantity);
    }, 0);

  const calculateItemTotal = (item) => {
    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
    return price * item.quantity;
  };

  const hasDiscount = (item) => item.discountType !== 'none' && item.discountValue > 0;
  const getDiscountDisplay = (item) =>
    item.discountType === 'percent'
      ? `${item.discountValue}%`
      : item.discountType === 'amount'
      ? `৳${item.discountValue}`
      : '';

  const handleCheckout = () => {
    toggleDrawer();
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      {/* Fixed Cart Button */}
      <div className="fixed font-inter cursor-pointer bg-bestdealbg border border-danger rounded-md right-6 top-[60%] text-texthead -translate-y-1/2 z-50 shadow-lg">
        <div onClick={toggleDrawer} className="flex flex-col rounded-md justify-center px-2">
          <h2 className="text-xl text-center flex justify-center pt-2">
            <HiOutlineShoppingBag />
          </h2>
          <h4 className="text-sm font-inter text-center">{totalItems}</h4>
          <h4 className="text-xs font-inter text-center uppercase">items</h4>
        </div>
        <h4 className="flex items-center rounded-b-md mt-0.5 w-full text-white gap-x-0.5 justify-center px-4 py-0.5 bg-danger">
          <FaBangladeshiTakaSign className="text-xs" />
          <span className="text-xs">{totalPrice.toFixed(0)}</span>
        </h4>
      </div>

      {/* Cart Drawer */}
      <Drawer open={isOpen} onClose={toggleDrawer} direction="right" size={600} className="font-inter">
        <div className="h-full flex flex-col bg-white">
          {/* Header */}
          <div className="flex justify-between items-center py-6 px-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <HiOutlineShoppingBag className="text-2xl text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Shopping Cart ({cartItems.length})
              </h3>
            </div>
            <button onClick={toggleDrawer} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200 group">
              <span className="text-sm font-medium">Close</span>
              <IoClose className="text-xl group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length > 0 ? (
              <div className="space-y-0">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-24 flex-shrink-0">
                        <img className="w-full h-full object-cover rounded-lg shadow-sm" src={item.photos[0]} alt={item.title} />
                        {hasDiscount(item) && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            {getDiscountDisplay(item)}
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              {item.brand?.title}
                            </p>
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.category?.title}
                            </p>
                            {item.author && (
                              <p className="text-xs text-gray-400 mt-1">
                                by {item.author.name}
                              </p>
                            )}
                          </div>
                          <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <FaBangladeshiTakaSign className="text-xs" />
                            {hasDiscount(item) ? item.salePrice.toFixed(0) : item.price}
                          </div>
                          {hasDiscount(item) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 line-through">
                              <FaBangladeshiTakaSign className="text-xs" />
                              {item.price}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button onClick={() => handleDecrement(item._id)} className="p-2 hover:bg-gray-100 transition-colors" disabled={item.quantity <= 1}>
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button onClick={() => handleIncrement(item._id)} className="p-2 hover:bg-gray-100 transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="bg-gray-100 px-3 py-1 rounded-full">
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                              <FaBangladeshiTakaSign className="text-xs" />
                              {calculateItemTotal(item).toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Subtotal */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Subtotal</h3>
                    <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                      <FaBangladeshiTakaSign />
                      {calculateSubtotal().toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <HiOutlineShoppingBag className="text-8xl text-gray-300 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Add some products to get started</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white border-t border-gray-200 space-y-3">
            {cartItems.length > 0 ? (
              <>
                <Link onClick={toggleDrawer} to={"/cart"} className="w-full inline-block text-center py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-200">
                  View Cart
                </Link>

                {/* ✅ Checkout Button that redirects based on login */}
                <button
                  onClick={handleCheckout}
                  className="w-full text-center py-3 inline-block bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Checkout
                </button>
              </>
            ) : (
              <button className="w-full py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-200 flex items-center justify-center gap-2">
                <TiArrowBackOutline className="text-lg" />
                Continue Shopping
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default FixedCart;
