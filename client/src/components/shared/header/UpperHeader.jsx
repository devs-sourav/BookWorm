import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import {
  CiCircleQuestion,
  CiMobile3,
  CiFacebook,
  CiInstagram,
  CiYoutube,
} from "react-icons/ci";
import { HiOutlineMapPin } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { FaMapLocation } from "react-icons/fa6";

const UpperHeader = () => {
  return (
    <header className="border-b px-5 sm:px-14 font-inter border-b-border  py-2.5 text-gray-200  block">
      {/* bg-brand */}
      <div className="  mx-auto text-texthead flex flex-wrap justify-between items-center ">
        <div className="flex gap-x-8 items-center">
          <Link
            to="mailto:bookworm.query@gmail.com"
            className="flex items-center gap-x-2 text-texthead transition-all ease-linear duration-200 hover:text-danger"
          >
            <span className="text-lg">
              <CiCircleQuestion />
            </span>
            <span className="text-para">Can we help you?</span>
          </Link>
          <Link
            to={"tel:01780508545"}
            className="flex items-center gap-x-2 text-texthead transition-all ease-linear duration-200 hover:text-danger"
          >
            <span className="text-lg">
              <CiMobile3 />
            </span>
            <span className="text-para">017 8050 8545</span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center ">
          <div className="flex items-center gap-x-5 ">
            <Link
              target="_blanck"
              to={"https://maps.app.goo.gl/umpc6JyseZBArsUv6"}
            >
              <span className="text-lg hover:text-danger text-gray-700 transition-all ease-linear duration-200">
                <FaMapLocation />
              </span>
            </Link>
            <Link
              to={"https://www.facebook.com/mybookworm"}
              target="_blank"
              rel="noreferrer"
              className="hover:text-danger text-gray-700  cursor-pointer"
            >
              <FaFacebookF className="text-lg hover:text-danger transition-all ease-linear duration-200" />
            </Link>

            <Link
              to={"https://www.instagram.com/my_bookworm/"}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand  text-gray-700  cursor-pointer"
            >
              <FaInstagram className="text-lg hover:text-danger transition-all ease-linear duration-200" />
            </Link>
            <Link
              to={"https://www.youtube.com/@MYbookworm"}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand text-gray-700 rounded-full transition-colors duration-[350ms] cursor-pointer"
            >
              <FaYoutube className="text-lg hover:text-danger transition-all ease-linear duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UpperHeader;
