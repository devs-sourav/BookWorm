import React from "react";
import Containar from "../../layouts/Containar";

const BradCumbs = ({ title, className }) => {
  return (
    <section className={`py-7 sm:py-10 md:py-14 ${className ? className : ""}`}>
      <Containar className="flex items-center justify-center">
        <h3 className="text-[24px] md:text-[28px] text-center font-medium inline-block">
          {title}
        </h3>
      </Containar>
    </section>
  );
};

export default BradCumbs;
