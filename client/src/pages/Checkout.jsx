import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import CheckoutForm from "../components/checkout/CheckoutForm";

const Checkout = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
        <BradCumbs className={"bg-[#FEF6F6]"} title={"Checkout"} />
        <CheckoutForm/>
    </>
  );
};

export default Checkout;
