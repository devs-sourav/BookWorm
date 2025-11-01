import React, { useState, useEffect, useRef, useContext } from "react";
import Containar from "../../layouts/Containar";
import { Link } from "react-router-dom";
import ProductItem from "../productitem/ProductItem";
import { useInView, motion, useAnimation } from "framer-motion";
import ApiContext from "../baseapi/BaseApi";
import axios from "axios";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';
// Import required modules
import { EffectFade, Autoplay } from 'swiper/modules';

const NewRelease = () => {
  const baseApi = useContext(ApiContext);
  const [currentList, setCurrentList] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const animation = useAnimation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${baseApi}/category`);
        
        // Take first 4 categories without reversing (newest first)
        const categories = data.data.doc.slice(0, 4);
        console.log('Categories will be displayed in this order:', categories.map(cat => cat.title));
        
        setCategory(categories);

        if (categories.length > 0) {
          const firstCategoryId = categories[0]._id;
          setSelectedCategory(firstCategoryId);
          
          // Updated API endpoint and response handling
          const { data: productData } = await axios.get(
            `${baseApi}/category/${firstCategoryId}/products`
          );
          
          const fetchedProducts = productData.data?.products || [];

          // Take first 8 products and reverse the order
          setCurrentList([...fetchedProducts].reverse().slice(0, 8));
        }
      } catch (err) {
        setError("Error fetching categories");
        console.error(err);
      }
    };

    fetchCategories();
  }, [baseApi]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await axios.get(`${baseApi}/banner`);
        const filteredBanners = data.data.doc.filter(
          (banner) => banner.bannerType === "New Release"
        );
        setBanners(filteredBanners);
      } catch (err) {
        setError("Error fetching banners");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [baseApi]);

  useEffect(() => {
    if (inView) {
      animation.start({
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration: 1,
          delay: 0.3,
          ease: "easeIn",
        },
      });
    }
  }, [inView, animation]);

  const handleSelect = async (id) => {
    setSelectedCategory(id);
    try {
      // Updated API endpoint and response handling
      const { data } = await axios.get(`${baseApi}/category/${id}/products`);
      const products = data.data?.products || [];
      setCurrentList([...products].reverse().slice(0, 8));
    } catch (err) {
      setError("Error fetching category products");
      console.error(err);
    }
  };

  return (
    <section ref={ref} className="pt-14 lg:pt-28 overflow-hidden">
      <Containar>
        <div className="flex flex-wrap justify-between items-center">
          <h3 className="text-center text-[24px] lg:text-head text-texthead font-medium">
            New Releases
          </h3>
          <ul className="flex gap-x-5 lg:gap-x-10 mt-2">
            {category.map((item) => (
              <li
                key={item._id}
                onClick={() => handleSelect(item._id)}
                className={`${
                  selectedCategory === item._id
                    ? 'text-base font-medium text-texthead relative before:content-[""] before:absolute before:-bottom-3 before:left-0 before:w-full before:h-[1px] before:bg-texthead cursor-pointer'
                    : 'text-base font-medium text-paracolor relative before:content-[""] before:absolute before:-bottom-3 before:right-0 before:w-0 before:h-[1px] before:bg-texthead cursor-pointer hover:before:left-0 hover:before:w-full before:transition-all before:ease-linear before:duration-200 hover:text-texthead transition-all ease-linear duration-200'
                }`}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-12 mt-10">
          {banners.length > 0 && (
            <motion.div
              animate={animation}
              initial={{ opacity: 0, y: 100 }}
              className="col-span-12 lg:inline-block md::col-span-6 lg:col-span-4 border border-border bg-bestdealbg hidden"
            >
              <Swiper
                modules={[EffectFade, Autoplay]}
                effect="fade"
                fadeEffect={{
                  crossFade: true
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                loop={true}
                className="w-full h-full"
              >
                {banners.map((banner, index) => (
                  <SwiperSlide key={banner._id || index}>
                    <Link to={banner.link}>
                      <img
                        className="w-full h-[690px] object-cover"
                        src={banner.photo}
                        alt={`New Release Banner ${index + 1}`}
                      />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          )}
          <motion.div
            animate={animation}
            initial={{ opacity: 0, x: 100 }}
            className="col-span-12 lg:col-span-8"
          >
            <div className="flex flex-wrap">
              {currentList.map((item) => (
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
                  priceAfterDiscount={item.salePrice}
                  freeShipping={item.freeShipping}
                  regularprice={item.price}
                  classItem="w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/4"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </Containar>
    </section>
  );
};

export default NewRelease;