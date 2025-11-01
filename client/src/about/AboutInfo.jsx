import React from "react";
import { Link } from "react-router-dom";
import Containar from "../layouts/Containar";
import { socialList } from "../components/constants";

const AboutInfo = () => {
  return (
    <section>
      <Containar>
        <div className="flex justify-center mb-36">
          <div className="w-[970px] h-[600px] px-20 py-20 bg-white relative -top-28 ">
            <div>
              <h3 className="text-4xl text-texthead font-medium">
                Welcome to Bookworm
              </h3>
              <p className="text-base italic text-texthead font-normal mt-12">
                “Many desktop publishing packages and web page editors now use
                Lorem Ipsum as their default model search for eolved over
                sometimes by accident, sometimes on purpose
              </p>
            </div>
            <div>
                <h3 className="text-xl font-medium text-texthead mt-10">What we really do?</h3>
                <p className="text-sm font-normal text-texthead mt-2">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam voluptates asperiores optio dolorem quia officiis ea saepe rerum, modi beatae laborum corporis. Rem sunt beatae eius cupiditate vitae fugit itaque adipisci natus. Odit commodi nostrum atque suscipit obcaecati autem doloribus et dicta, enim distinctio earum quisquam dolor nulla voluptates non excepturi eveniet rerum quos esse molestiae voluptatum doloremque? Repudiandae, adipisci! Quas, vitae nemo rem beatae quo dolor obcaecati. Ratione facilis quas quia, libero voluptas perferendis atque, voluptates saepe id recusandae unde laborum sit qui in cupiditate ullam nobis doloribus impedit reprehenderit rem! Hic, praesentium doloribus aliquam dicta nostrum suscipit commodi?</p>
            </div>
            <div className="mt-10 flex gap-x-28">
                <div>
                    <h3 className="text-xl text-texthead font-medium">Our Vision</h3>
                    <p className="text-sm mt-2 text-texthead font-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Delectus animi laudantium iste debitis consequuntur, minima rem. Cum commodi eos, non dolorum at aut impedit cumque veritatis pariatur labore, iure facere?</p>
                </div>
                <div>
                    <h3 className="text-xl mt-2 text-texthead font-medium">Our Vision</h3>
                    <p className="text-sm text-texthead font-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Delectus animi laudantium iste debitis consequuntur, minima rem. Cum commodi eos, non dolorum at aut impedit cumque veritatis pariatur labore, iure facere?</p>
                </div>
            </div>
            <div>
              <h3 className="text-xl text-texthead font-medium mt-16">
                Social Media
              </h3>
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
