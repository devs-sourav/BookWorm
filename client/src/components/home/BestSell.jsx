import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import TitleHead from "../titlehead/TitleHead";
import { BsCartCheck } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBangladeshiTakaSign,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import bestimage1 from "../../assets/bestsell/bestsell1.jpg"; // Fallback image
import ProductItem from "../productitem/ProductItem";
import { LuChevronRight } from "react-icons/lu";
import ApiContext from "../baseapi/BaseApi";

const BestSell = () => {
  const [productList, setProductList] = useState([]);
  const navigate = useNavigate();
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseApi}/product?sort=saleNumber`);
        const fetchedProducts = response.data.data.doc;

        // Since there's no product nesting anymore, we can directly use the products
        // Remove duplicates based on product ID (if needed)
        const uniqueProducts = [];
        const seenProductIds = new Set();
        fetchedProducts.forEach((item) => {
          if (!seenProductIds.has(item._id)) {
            seenProductIds.add(item._id);
            uniqueProducts.push(item);
          }
        });

        setProductList(uniqueProducts);
        // console.log(response.data.data.doc);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="pt-14 lg:pt-28 font-inter">
      <Containar>
        <div>
          <div className="flex flex-wrap justify-between items-center">
            <h3 className="text-[24px] mr-3 lg:text-head text-texthead font-medium">
              Best Selling
            </h3>
            <h3 className="text-sm md:text-base font-normal mt-2 sm:mt-0 flex items-center gap-x-1 md:gap-x-2 cursor-pointer hover:text-danger transition-all ease-linear duration-200">
              <span onClick={() => navigate("/shop/mega-sale")}>View All</span>
              <span>
                <LuChevronRight className="text-base md:text-2xl" />
              </span>
            </h3>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 2 }}
            className="mt-12 w-full relative"
          >
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              loop={true}
              speed={1000}
              autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
              navigation={{
                nextEl: ".swiper-button-next1",
                prevEl: ".swiper-button-prev1",
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                370: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1278: { slidesPerView: 6 },
              }}
              className="mySwiper w-full group-edit h-[340px]"
            >
              {productList.map((item, index) => (
                <SwiperSlide key={index}>
                  <ProductItem
                    key={item._id}
                    product={item}
                    image={item.photos}
                    id={item._id}
                    subtitle={item.brand?.title}
                    title={item.title}
                    categoryId={item.category?._id}
                    brandId={item.brand?._id}
                    categoryName={item.category?.title}
                    discount={item.discountValue}
                    discountType={item.discountType}
                    discountPercent={item.discountValue}
                    priceAfterDiscount={item.salePrice}
                    offerprice={item.price - (item.discountValue || 0)}
                    freeShipping={item.freeShipping}
                    regularprice={item.price}
                    classItem="w-full h-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="swiper-button-next1 z-20 absolute -right-5 lg:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]">
              <FaChevronRight className="text-xs" />
            </div>
            <div className="swiper-button-prev1 absolute z-20 -left-5 lg:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]">
              <FaChevronLeft className="text-xs" />
            </div>
          </motion.div>
        </div>
      </Containar>
    </section>
  );
};

export default BestSell;