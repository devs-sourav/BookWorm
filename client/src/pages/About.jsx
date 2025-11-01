import React, { useEffect } from "react";
import AboutBanner from "../components/about/AboutBanner";
import AboutInfo from "../components/about/AboutInfo";
import BradCumbs from "../components/bradcumbs/BradCumbs";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <BradCumbs title={"About Us"} />
      <AboutBanner />
      <AboutInfo />
    </>
  );
};

export default About;
