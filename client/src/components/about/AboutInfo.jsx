import React from "react";
import { Link } from "react-router-dom";
import Containar from "../../layouts/Containar";
import { socialList } from "../constants";

const AboutInfo = () => {
  return (
    <section>
      <Containar>
        <div className="flex justify-center mb-36">
          <div className="w-[970px] lg:min-h-[600px] px-0 sm:px-20 py-20 bg-white sm:relative -top-28">
            {/* Welcome to BOOKWORM */}
            <div>
              <h3 className="text-2xl md:text-4xl text-texthead font-medium">
                Welcome to BOOKWORM
              </h3>
              <p className="text-base italic text-texthead font-normal mt-12">
                At BOOMWORM, we are more than just an e-commerce platform; we are a
                dedicated partner in enhancing your everyday life through our
                diverse product offerings. Our extensive catalog includes
                high-quality fashion and garments, cutting-edge electronics,
                health and beauty essentials, home and kitchen products,
                educational materials, sports and outdoor gear, children's
                items, and personal care solutions.
              </p>
            </div>

            {/* Our Mission */}
            <div>
              <h4 className="text-xl font-medium text-texthead mt-10">
                Our Mission
              </h4>
              <p className="text-sm font-normal text-texthead mt-2">
                Our mission is to provide an exceptional shopping experience by
                offering products that not only meet but exceed your
                expectations. We are committed to delivering value through:
              </p>

              {/* Mission Points - Changed to Numeric List */}
              <ol className="list-decimal list-inside mt-2 space-y-3">
                <li>
                  <strong>Quality and Variety:</strong> We meticulously curate
                  our product range to ensure you have access to a wide variety
                  of high-quality items. From the latest fashion trends to
                  essential home goods, our selection is designed to cater to
                  all your needs.
                </li>
                <li>
                  <strong>Customer-Centric Service:</strong> At BOOKWORM, customer
                  satisfaction is at the heart of everything we do. We strive to
                  make your shopping experience as seamless and enjoyable as
                  possible. Our goal is to provide you with reliable service and
                  support at every step of your journey with us.
                </li>
                <li>
                  <strong>Trust and Integrity:</strong> We believe in building
                  long-term relationships with our customers based on trust and
                  transparency. Our policies are designed to ensure that you
                  receive the best service, and we are always here to address
                  any concerns or questions you may have.
                </li>
                <li>
                  <strong>Innovation and Excellence:</strong> We continuously
                  seek ways to improve our services and offerings. By staying
                  updated with industry trends and customer feedback, we aim to
                  enhance our platform and provide you with an exceptional
                  shopping experience.
                </li>
              </ol>
            </div>

            {/* Vision Section */}
            <div className="mt-10">
              <h4 className="text-xl text-texthead font-medium">Our Vision</h4>
              <p className="text-sm mt-2 text-texthead font-normal">
                Our vision is to redefine the shopping experience by seamlessly
                blending quality, style, and affordability. We aim to be a
                trusted companion in your journey to discover products that
                enhance your life. Our commitment to innovation and customer
                satisfaction drives us to continuously evolve, ensuring that
                every interaction with BOOKWORM is a step toward a more inspired
                and fulfilled lifestyle.
              </p>
            </div>

            {/* Social Media Section */}
            <div>
              <h4 className="text-xl text-texthead font-medium mt-16">
                Follow Us on Social Media
              </h4>
              <ul className="mt-5 flex gap-x-7">
                {socialList.map((item, index) => {
                  let Icon = item.logo;
                  return (
                    <li key={index}>
                      <Link
                        to={item.link}
                        className="transition-all ease-linear duration-100 hover:text-danger"
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

export default AboutInfo;
