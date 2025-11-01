import React, { useEffect } from "react";
import CartBox from "../components/carts/CartBox";
import CartBradCumbs from "../components/carts/CartBradCumbs";
import CartProductItem from "../components/carts/CartProductItem";
const Cart = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
    
      <CartBradCumbs />
      <CartBox />
      <CartProductItem/>
    </>
  );
};

export default Cart;
