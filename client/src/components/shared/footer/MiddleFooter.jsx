import React from "react";
import Containar from "../../../layouts/Containar";
import { BsRocketTakeoff, BsCreditCard } from "react-icons/bs";
import { MdCurrencyExchange } from "react-icons/md";
import { IoRocketOutline } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { socialList } from "../../constants";

const MiddleFooter = () => {
  const servicelist = [
    {
      title: "Fast and free delivery",
      details: "Free delivery for all orders over $200",
      icon: BsRocketTakeoff,
    },
    {
      title: "Money back guarantee",
      details: "We return money within 30 days",
      icon: MdCurrencyExchange,
    },
    {
      title: "24/7 customer support",
      details: "Friendly 24/7 customer support",
      icon: BiSupport,
    },
    {
      title: "Secure online payment",
      details: "We possess SSL / Secure сertificate",
      icon: BsCreditCard,
    },
  ];

  const infolist = [
    {
        name:"Outlets",
        link:"/contact",
    },
    {
        name:"Shop Address",
        link:"/contact",
    },
    {
        name:"Support",
        link:"/contact",
    },
    {
        name:"Privacy",
        link:"/privacy",
    },
    {
        name:"Terms & Condition",
        link:"/terms-condition",
    },
    // {
    //     name:"FAQ",
    //     link:"/faq",
    // },
  ]

  return (
    <div className="bg-[#2B3445] ">
      <Containar>
        <div>
          <ul className="flex flex-wrap items-center gap-y-8 justify-between py-12 border-b border-b-gray-600">
            {servicelist.map((item, index) => {
              let Icon = item.icon;
              return (
                <li  key={index} className="flex w-full sm:w-1/2 lg:w-[24%]  gap-x-5 items-center">
                  <h3>
                    <Icon className="text-5xl text-danger" />
                  </h3>
                  <div>
                    <h3 className="text-base text-white font-medium">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-normal mt-1">
                      {item.details}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div>
            <ul className="flex justify-between flex-wrap  py-8">
              <li>
                <Link to={"/"} className=" text-lg font-medium text-danger">
                  Electronic Store
                </Link>
                <div className="flex flex-wrap gap-x-5 gap-y-3 sm:gap-x-10 mt-5">
                    {
                        infolist.map((item,index)=>(
                            <Link to={item.link} className="text-base text-gray-400 hover:text-danger transition-all ease-linear duration-200" key={index}>{item.name}</Link>
                        ))
                    }
                </div>
              </li>
              <li>
                <ul className="flex items-center gap-x-5 mt-5 lg:mt-0">
                  {socialList.map((item, index) => {
                    let Logo = item.logo
                    return (
                      <Link target="_blanck" to={item.link} key={index} className="flex hover:bg-danger transition-all ease-linear duration-200 hover:text-white justify-center items-center w-10 h-10 rounded-md bg-[#3C4454]">
                        <Logo className="text-white"/>
                      </Link>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </Containar>
    </div>
  );
};

export default MiddleFooter;
