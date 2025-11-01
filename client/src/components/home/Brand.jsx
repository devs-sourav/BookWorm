import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import TitleHead from "../titlehead/TitleHead";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import brand1 from "../../assets/brand//brand1.jpg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useInView, motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import ApiContext from "../baseapi/BaseApi";

const brandlist = [
  // Your brandlist data
];

const Brand = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const animation = useAnimation();
  const [data, setData] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    getCZone();
  }, []);

  // useEffect(() => {
  //   getCArea(ZoneKey);
  // }, [ZoneKey]);

  const getCZone = async () => {
    try {
      const response = await axios.get(
        // `https://courier-api-sandbox.pathao.com/aladdin/api/v1/issue-token`,
        `https://api-hermes.pathao.com/aladdin/api/v1/issue-token`,
        {
          client_id: "zPdyrnWeQr",
          client_secret: "fkZAmYg70lauumpWscIL5MizKURkjaKL9sDOVBAe",
          username: "al.adal0021@gmail.com",
          password: "Ak2021@#",
          grant_type: "password",
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      // You can handle the successful response here if needed
      console.log("Token received:", response.data);
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Error fetching token:", error);
    }
  };

  useEffect(() => {
    if (inView) {
      animation.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          delay: 0.3,
          ease: "easeIn",
        },
      });
    }
  }, [inView, animation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApi}/brand`);
        setData(response.data?.data.doc || []); // Fallback to empty array
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseApi]);

  return (
    <section
      ref={ref}
      className="pt-14 lg:pt-28 overflow-hidden lg:mb-28 mb-14"
    >
      <Containar>
        <TitleHead titile={"All Publihsers"} subtitle={"View All"} />
        <motion.div
          animate={animation}
          initial={{ opacity: 0, y: 100 }}
          className="mt-10 relative"
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            loop={true}
            speed={1000}
            autoplay={{ delay: 1000, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".swiper-button-next7",
              prevEl: ".swiper-button-prev7",
            }}
            breakpoints={{
              370: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
              1024: {
                slidesPerView: 5,
              },
              1280: {
                slidesPerView: 6,
              },
            }}
            className="mySwiper"
          >
            {data.length > 0 ? (
              data.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="w-[233px] h-[233px] p-10 border-border border hover:border-texthead ">
                    <Link
                      className="flex justify-center object-cover w-full h-full"
                      to={`/shop/brand/${item?._id}`}
                    >
                      <img
                        className="object-cover w-full h-full"
                        alt="brand"
                        src={item?.photo}
                      />
                    </Link>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <p>No brands available</p>
            )}
          </Swiper>
          <div
            className={`swiper-button-next7 absolute -right-5 z-20 lg:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]`}
          >
            <FaChevronRight className="text-xs" />
          </div>
          <div
            className={`swiper-button-prev7 absolute -left-5 z-20 lg:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]`}
          >
            <FaChevronLeft className="text-xs" />
          </div>
        </motion.div>
      </Containar>
    </section>
  );
};

export default Brand;
