import React from "react";
import Containar from "../../../layouts/Containar";
import logo from "../../../assets/logos/logowhite.png";
import { Link } from "react-router-dom";

const BottomFooter = () => {
  return (
    <footer className="font-inter py-5 bg-[#2B3445]">
      <Containar>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            ©2024{" "}
            <span className="text-danger">
              <span target="_blanck">bookworm</span>
            </span>
            , All rights reserved. Developed by{" "}
            <Link
              target="_blanck"
              to={"https://www.BookWorm.com"}
              className="text-[#fff] font-semibold "
            >
              BookWorm
            </Link>
          </p>
          <Link className="flex items-baseline" to={"/"}>
            <div className="w-16">
              <img className="w-full" src={logo} />
            </div>
           
          </Link>
        </div>
      </Containar>
    </footer>
  );
};

export default BottomFooter;
