import React, { useEffect, useRef } from "react";
import Containar from "../../layouts/Containar";
import TitleHead from "../titlehead/TitleHead";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Navigation } from "swiper/modules";
import review1 from "../../assets/review/review1.png";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useInView, motion, useAnimation } from "framer-motion";

const weeklybannerlist = [
  {
    image: review1,
  },
  {
    image: review1,
  },
  {
    image: review1,
  },
  {
    image: review1,
  },
  {
    image: review1,
  },
  {
    image: review1,
  },
  {
    image: review1,
  },
  {
    image: review1,
  },
];

const Review = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const animation = useAnimation();

  useEffect(() => {
    if (inView) {
      animation.start({
        opacity: 1,
        y: 0,

        transition: {
          duration: 1,
          delay: 0.3,
          ease: "easeIn",
          opacity:0
        },
      });
    }
  }, [inView, animation]);

  return (
    <section ref={ref} className="py-28 overflow-hidden">
      <Containar>
        {/* <motion.div animate={animation} initial={{ opacity: 0, y: 50 }}> */}
          <TitleHead titile="Customer Review" subtitle="View All" />
        {/* </motion.div> */}
        <motion.div
          className="mt-10 bg-white relative"
          animate={animation}
          initial={{ opacity: 0, y: 100 }}
          //   transition={{ delay: 0.3, duration: 0.7 }}
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
                slidesPerView: 2,
              },
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="mySwiper"
            style={{
              transitionTimingFunction: "ease-in-out", // Optional: Customize the easing function
            }}
          >
            {weeklybannerlist.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-[200px] border hover:border-texthead transition-all ease-linear duration-150 border-border hover:drop-shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    src={item.image}
                    alt="weekly2"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-button-next4 absolute -right-16 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380] ">
            <FaChevronRight className="text-xs" />
          </div>
          <div className="swiper-button-prev4 absolute -left-16 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]">
            <FaChevronLeft className="text-xs" />
          </div>
        </motion.div>
      </Containar>
    </section>
  );
};

export default Review;
