import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/shared/header/Header";
import Footer from "../components/shared/footer/Footer";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import FixedCart from "../components/floatcart/FixedCart";
import ScrollToTop from "react-scroll-to-top";

const RootLayout = () => {
  const location = useLocation();
  const hideHeaderFooterPaths = ["/registration", "/login","/forgot-password","/reset-password"];

  // Check if current route matches any path where header/footer should be hidden
  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="font-inter">
      <Theme>
        <ScrollToTop
          style={{ backgroundColor: "#fff6f6", border: "1px solid #f74545" }}
          className="bg-danger inline-block"
          smooth
          color="#f75454"
        />

        {location.pathname !== "/cart" && <FixedCart />}

        {!shouldHideHeaderFooter && <Header />}

        <Outlet />

        {!shouldHideHeaderFooter && <Footer />}
      </Theme>
    </div>
  );
};

export default RootLayout;
