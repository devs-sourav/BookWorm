import React, { useEffect } from "react";
import Banner from "../components/home/Banner";
import Feature from "../components/home/Feature";
import BestSell from "../components/home/BestSell";
import SaleFeature from "../components/home/SaleFeature";
import BestDealWeek from "../components/home/BestDealWeek";
import NewRelease from "../components/home/NewRelease";
import Brand from "../components/home/Brand";
import Review from "../components/home/Review";
import Containar from "../layouts/Containar";
import BannerSection from "../components/home/NewBanner";
import CouponSection from "../components/coupon/CouponSection";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* <Banner /> */}
      <BannerSection/>
      <Feature />
      <BestSell />
      <CouponSection/>
      <SaleFeature />

      {/* <BestDealWeek /> */}
      <NewRelease />
      <Brand />
      {/* <Review /> */}
    </>
  );
};

export default Home;
