import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import TitleHead from "../titlehead/TitleHead";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useInView, motion, useAnimation } from "framer-motion";
import ApiContext from "../baseapi/BaseApi";
import { FaStar } from "react-icons/fa";

const Review = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const animation = useAnimation();
  const [data, setData] = useState([]); // State for holding fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseApi = useContext(ApiContext); // Use context for base API URL

  // console.log(data);

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
        const response = await axios.get(`${baseApi}/review`); // Adjust the endpoint as needed
        setData(response.data.data.doc || []); // Update state with fetched data
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseApi]);

  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <section ref={ref} className="py-14 lg:py-28 overflow-hidden">
      <Containar>
        <TitleHead titile="Customer Review" subtitle="View All" />
        <motion.div
          className="mt-7 lg:mt-10 bg-white relative"
          animate={animation}
          initial={{ opacity: 0, y: 100 }}
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            speed={2000}
            loop={true}
            autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
            navigation={{
              nextEl: ".swiper-button-next4",
              prevEl: ".swiper-button-prev4",
            }}
            breakpoints={{
              370: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
              1280: {
                slidesPerView: 4,
              },
            }}
            className="mySwiper"
            style={{
              transitionTimingFunction: "ease-in-out", // Optional: Customize the easing function
            }}
          >
            {data.map((item, index) => {
              const stars = Array(5).fill(false);
              for (let i = 0; i < Math.round(item.rating); i++) {
                stars[i] = true;
              }

              return (
                <SwiperSlide key={index}>
                  <div className="w-full px-7 py-6 h-[200px] border hover:border-texthead transition-all ease-linear duration-150 border-border">
                    <div className="flex gap-x-5 items-center">
                      <div className="w-14 h-14 ">
                        <img
                          className="w-full h-full rounded-full object-cover"
                          src={item?.photo}
                        />
                      </div>
                      <div>
                        <h2 className="text-base font-medium">{item?.name}</h2>

                        <div className="flex gap-x-2 items-center mt-1.5 text-xs">
                          {stars.map((filled, starIndex) => (
                            <FaStar
                              key={starIndex}
                              className={`${
                                filled ? "text-yellow-500" : "text-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm mt-4">{item?.description}</p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="swiper-button-next4 absolute z-20 -right-5 lg:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380] ">
            <FaChevronRight className="text-xs" />
          </div>
          <div className="swiper-button-prev4 absolute z-20 -left-5 lg:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]">
            <FaChevronLeft className="text-xs" />
          </div>
        </motion.div>
      </Containar>
    </section>
  );
};

export default Review;
