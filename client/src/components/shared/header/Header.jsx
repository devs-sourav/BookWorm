import React from "react";
import UpperHeader from "./UpperHeader";
import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import HeadNavbar from "./HeadNavbar";
import CouponTicker from "../../coupon/CouponTicker";

const header = () => {
  return (
    <>
      {/* <UpperHeader /> */}
      <CouponTicker/>
      <Navbar/>
      {/* <MobileNavbar/> */}
      {/* <HeadNavbar/> */}
    </>
  );
};

export default header;
