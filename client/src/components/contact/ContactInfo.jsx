import React from "react";
import Containar from "../../layouts/Containar";
import { Link } from "react-router-dom";
import { socialList } from "../constants";

const ContactInfo = () => {
  return (
    <section>
      <Containar>
        <div className="flex justify-center mb-36">
          <div className="w-[970px] lg:h-[400px] px-0 sm:px-20 py-10 sm:py-20 bg-white block relative top-0 sm:-top-28 ">
            <div>
              <h3 className="text-2xl md:text-4xl text-texthead font-medium">
                Contact Information
              </h3>
              <p className="text-base italic text-texthead font-normal mt-12">
                We will answer any questions you may have about our online
                sales, rights or partnership service right here.
              </p>
            </div>

            <div className="mt-14 mx-auto flex gap-x-36 flex-wrap ">
              <div className="mb-5 lg:mb-0">
                <div>
                  <h4 className="text-xl font-medium text-texthead">Kakrail</h4>
                  <p className="mt-4 text-texthead text-sm">
                    73, Kakrail, Dhaka-1000, Dhaka
                    <br />
                    Bangladesh
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to={"mailto:bookworm.query@gmail.com"}
                    className="text-sm text-texthead mb-1 block hover:text-danger"
                  >
                    bookworm.query@gmail.com
                  </Link>
                  <Link
                    to={"tel:017 8050 8545"}
                    className="text-sm text-texthead hover:text-danger"
                  >
                    01629-169610
                  </Link>
                  <br />
                  <Link
                    to={"tel:09638 189006"}
                    className="text-sm text-texthead hover:text-danger"
                  >
                    09638 189006
                  </Link>
                </div>
              </div>
              {/* <div className="">
                <div>
                  <h4 className="text-xl font-medium text-texthead">
                    New York Office
                  </h4>
                  <p className="mt-4 text-texthead text-sm">
                    1418 River Drive, Suite 35 Cottonhall, CA 9622
                    <br /> United States
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to={"mailto:info.BookWorm@gmail.com"}
                    className="text-sm text-texthead mb-1 block transition-all ease-linear duration-100 hover:text-danger"
                  >
                    info.BookWorm@gmail.com
                  </Link>
                  <Link
                    to={"tel:01629169610"}
                    className="text-sm text-texthead transition-all ease-linear duration-100 hover:text-danger"
                  >
                    +880-1629169610
                  </Link>
                </div>
              </div> */}
            </div>
            <div className="mt-16">
              <h3 className="text-xl text-texthead font-medium ">
                Social Media
              </h3>
              <ul className="pt-5 flex gap-x-7">
                {socialList.map((item, index) => {
                  let Icon = item.logo;
                  return (
                    <li key={index}>
                      <Link
                        to={item.link}
                        target="_blanck"
                        className="transition-all ease-linear duration-100 hover:text-danger block"
                      >
                        <Icon />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Containar>
    </section>
  );
};

export default ContactInfo;
