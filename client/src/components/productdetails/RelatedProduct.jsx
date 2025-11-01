import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import Containar from "../../layouts/Containar";
import ProductItem from "../productitem/ProductItem";
import ApiContext from "../baseapi/BaseApi";

const RelatedProduct = ({ productId }) => {
  const [productList, setProductList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await fetch(`${baseApi}/product/${productId}/related`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data?.status === "success" && data?.data?.books) {
          setProductList(data.data.books);
        } else {
          setProductList([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setError(error.message);
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productId, baseApi]);

  // Loading State
  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <Containar>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Related Products
            </h2>
            <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
              >
                <div className="bg-gray-200 aspect-[3/4] rounded-md mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </Containar>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <Containar>
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Related Products
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We're having trouble loading related products right now.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Containar>
      </section>
    );
  }

  // No Products State
  if (productList.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <Containar>
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Related Products Found
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We couldn't find any similar products at the moment.
              </p>
              <Link
                to="/shop"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Browse All Products
              </Link>
            </div>
          </div>
        </Containar>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <Containar>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Related Products
            </h2>
            <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
          </div>
          <div className="text-sm text-gray-500">
            {productList.length} item{productList.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Products Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={24}
            loop={productList.length > 1}
            speed={800}
            autoplay={{
              delay: 5000,
              pauseOnMouseEnter: true,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            breakpoints={{
              480: {
                slidesPerView: 2,
                spaceBetween: 0,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 0,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 0,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 0,
              },
            }}
            className="pb-4"
          >
            {productList.map((book) => (
              <SwiperSlide key={book._id}>
                <div className="h-[340px]">
                  <ProductItem
                    key={book._id}
                    product={book}
                    image={book.photos}
                    id={book._id}
                    subtitle={book.brand?.title || book.author?.name}
                    title={book.title}
                    categoryId={book.category?._id}
                    brandId={book.brand?._id}
                    categoryName={book.category?.title}
                    discount={book.discountValue}
                    discountType={book.discountType}
                    discountPercent={book.discountValue}
                    priceAfterDiscount={book.salePrice}
                    offerprice={book.price - (book.discountValue || 0)}
                    freeShipping={book.freeShipping}
                    regularprice={book.price}
                    classItem="w-full h-full"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          {productList.length > 1 && (
            <>
              <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 -ml-5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 -mr-5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All Products
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </Containar>
    </section>
  );
};

export default RelatedProduct;