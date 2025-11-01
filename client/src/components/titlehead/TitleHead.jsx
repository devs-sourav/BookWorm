import React from "react";
import { LuChevronRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const TitleHead = ({ titile, subtitle }) => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-wrap justify-between items-center">
      <h3

        className="text-[24px] mr-3 lg:text-head text-texthead font-medium"
      >
        {titile}
      </h3>
      <h3 className="text-sm md:text-base font-normal mt-2 sm:mt-0 flex items-center gap-x-1 md:gap-x-2 cursor-pointer hover:text-danger transition-all ease-linear duration-200">
        <span onClick={()=>navigate("/shop")}>{subtitle}</span>
        <span>
          <LuChevronRight className="text-base md:text-2xl" />
        </span>
      </h3>
    </div>
  );
};

export default TitleHead;
