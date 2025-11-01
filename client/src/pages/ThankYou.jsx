import React, { useEffect } from "react";
import Containar from "../layouts/Containar";
import { Link } from "react-router-dom";
import { LuChevronRight, LuHeartHandshake } from "react-icons/lu";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

const ThankYou = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="font-inter">
      <div>
        <div className="border-b border-b-border">
          <Containar>
            <h3 className="flex gap-x-2 py-5 items-center text-sm">
              <Link className="inline-block" to={"/"}>
                Home
              </Link>{" "}
              <span>
                <LuChevronRight className="text-sm" />
              </span>{" "}
              <Link className="inline-block" to={"/"}>
                Thank You
              </Link>
            </h3>
          </Containar>
        </div>
        <div>
          <Containar>
            <div className="py-20">
              <h2 className="text-[100px] flex items-center justify-center  font-medium text-center text-green-600">
                <FaRegCircleCheck />
              </h2>
              <h2 className="text-2xl mt-10 text-texthead font-medium text-center">
                ধন্যবাদ
              </h2>
              <h2 className="text-3xl mt-7 text-green-600 font-medium text-center">
                আপনার অর্ডারটি সম্পন্ন হয়েছে
              </h2>
              <h4 className="text-base mt-5 text-center">
                অর্ডারটি সম্পর্কে জানতে যোগাযোগ করুনঃ
              </h4>
              <h4 className="text-lg mt-5 text-center flex justify-center text-green-600">
                <Link
                  to={"tel:017 8050 8545"}
                  className="flex items-center gap-x-2"
                >
                  <FaPhoneAlt />
                  01629-169610
                </Link>
              </h4>
              <h4 className="text-base mt-5 text-center flex justify-center text-texthead">
                <Link
                  to={"mailto:bookworm.query@gmail.com"}
                  className="flex items-center gap-x-2"
                >
                  <MdOutlineMail /> bookworm.query@gmail.com
                </Link>
              </h4>
              <p className="text-center mt-5">You can check more products</p>
              <div className="mt-5 flex justify-center">
                <Link
                  to={"/shop"}
                  className=" text-center  inline-block cursor-pointer py-4 px-16 bg-texthead text-white"
                >
                  Go Back to Shop
                </Link>
              </div>
            </div>
          </Containar>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
