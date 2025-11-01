import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import Containar from "../../layouts/Containar";
import bgbanner from "../../assets/banner/bgbanner.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Navigation, EffectFade, Pagination } from "swiper/modules";
import "swiper/css/effect-fade";
import axios from "axios";
import ApiContext from "../baseapi/BaseApi";

const Banner = () => {
  const [bannerList, setBannerList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await axios.get(`${baseApi}/banner`);
        const banners = response.data.data.doc.filter(
          (item) => item?.bannerType === "Main Banner"
        );
        setBannerList(banners);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchBannerData();
  }, [baseApi]);

  const handleSlideChange = (swiper) => {
    setCurrentSlide(swiper.realIndex);
  };

  if (loading) return ;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <section
      className="font-inter block"
      style={{ backgroundImage: `url(${bgbanner})` }}
    >
      <div className="pt-14 lg:pt-28 pb-16 md:pb-28 bg-bottom">
        <Containar className="relative banner-part">
          <Swiper
            modules={[Navigation, EffectFade, Pagination, Autoplay]}
            slidesPerView={1}
            effect="fade"
            speed={1000}
            loop={true}
            autoplay={{ delay: 5000 }}
            pagination={{
              el: ".custom-pagination",
              clickable: true,
            }}
            onSlideChange={handleSlideChange}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 1 },
              1024: { slidesPerView: 1 },
            }}
            className="mySwiper"
          >
            {bannerList.map((item, i) => (
              <SwiperSlide key={item?._id}>
                <div className="flex justify-between flex-wrap-reverse items-center overflow-hidden">
                  <div className="mt-8 w-full md:w-[55%] lg:w-[50%] mb-5 md:mb-0 md:mt-0">
                    {currentSlide === i && (
                      <>
                        <motion.h4
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1 }}
                          onClick={() => navigate(item?.link)}
                          className="text-base uppercase text-center md:text-start font-bold text-textgray cursor-pointer"
                        >
                          {item.subTitle}
                        </motion.h4>
                        <motion.h2
                          initial={{ opacity: 0, y: 200 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8 }}
                          onClick={() => navigate(item?.link)}
                          className="text-[28px] sm:text-[36px] text-center md:text-start md:text-[46px] lg:text-[50px] xl:text-banhead text-texthead leading-[40px] md:leading-[60px] lg:leading-[72px] mt-2 lg:mt-2 cursor-pointer"
                        >
                          <span>{item.title}</span>
                        </motion.h2>
                        <div className="mt-8 lg:mt-10 mb-10 lg:mb-0">
                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -600,
                              translateX: "-10%",
                            }}
                            animate={{ opacity: 1, x: 0, translateX: "0" }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                          >
                            <Link
                              to={item?.link}
                              className="px-12 py-4 md:inline-block block text-center md:text-start font-medium text-white bg-danger"
                            >
                              <span>See All</span>
                            </Link>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </div>
                  {currentSlide === i && (
                    <div className="w-full md:w-[40%] h-[240px] md:h-[280px] lg:h-[360px] lg:w-[49%]">
                      <motion.img
                        key={i}
                        initial={{ opacity: 0, x: 700 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-contain cursor-pointer"
                        src={item?.photo}
                        alt="banner"
                        onClick={() => navigate(item?.link)}
                      />
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-pagination absolute md:left-0 left-0 bottom-20 md:bottom-0"></div>
        </Containar>
      </div>
    </section>
  );
};

export default Banner;
