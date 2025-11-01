import React, { useEffect } from "react";
import Containar from "../layouts/Containar";
import { Link } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";

const NotFound = () => {
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
                Error 404
              </Link>
            </h3>
          </Containar>
        </div>
        <div>
          <Containar>
            <div className="py-20">
              <h2 className="text-[200px] text-texthead font-medium text-center">
                404
              </h2>
              <h2 className="text-xl text-texthead font-medium text-center">
                Woops, looks like this page does not exist
              </h2>
              <p className="text-center mt-3">
                You could either go back or go to homepage
              </p>
              <p className="text-center mt-3">
                Developed by{" "}
                <span className="font-medium">
                  <Link target="_blanck" to={"https://www.BookWorm.com/"}>
                    BookWorm
                  </Link>
                </span>
              </p>
              <div className="mt-5 flex justify-center">
                <Link
                  to={"/"}
                  className=" text-center mt-5 inline-block cursor-pointer py-4 px-16 bg-texthead text-white"
                >
                  Go Back
                </Link>
              </div>
            </div>
          </Containar>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
