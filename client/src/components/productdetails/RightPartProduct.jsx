import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import ApiContext from "../baseapi/BaseApi";

const RightPartProduct = ({ productId }) => {
  const [productList, setProductList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`${baseApi}/product/${productId}/related`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data?.status === "success" && data?.data?.books) {
          // Remove duplicates based on product ID
          const uniqueProducts = [];
          const seenProductIds = new Set();
          
          data.data.books.forEach((book) => {
            if (!seenProductIds.has(book._id)) {
              seenProductIds.add(book._id);
              uniqueProducts.push(book);
            }
          });
          
          setProductList(uniqueProducts);
        } else {
          setProductList([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setError("Error fetching products. Please try again later.");
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productId, baseApi]);

  if (loading) {
    return (
      <ul className="border border-border py-3 flex flex-wrap justify-between xl:block">
        <li className="px-[30px] py-5">Loading products...</li>
      </ul>
    );
  }

  return (
    <ul className="border border-border py-3 flex flex-wrap justify-between xl:block">
      {error && (
        <li className="px-[30px] py-5 text-red-500 text-sm">{error}</li>
      )}
      {productList.length === 0 ? (
        <li className="px-[30px] py-5">No products available</li>
      ) : (
        productList.slice(0, 3).map((book) => (
          <li
            key={book._id}
            className="flex w-full md:w-[47%] xl:w-full gap-x-4 px-[30px] py-5"
          >
            <Link
              to={`/productdetail/${book._id}`}
              className="w-[20%]"
            >
              <img
                className="w-full object-contain"
                src={book?.photos?.[0] || ""}
                alt={book?.title || "Product Image"}
              />
            </Link>
            <div className="w-[70%]">
              <Link
                to={`/productdetail/${book._id}`}
                className="text-sm font-normal inline-block -pt-1 text-texthead hover:text-danger"
              >
                {book?.title}
              </Link>
              <div className="flex gap-x-0.5 items-center text-base mt-2">
                {book?.salePrice && book.salePrice < book.price ? (
                  <div className="flex gap-x-3">
                    <div className="flex text-sm items-center gap-x-1">
                      <FaBangladeshiTakaSign />
                      {book.salePrice}
                    </div>
                    <div className="flex text-xs items-center gap-x-0.5 line-through">
                      <FaBangladeshiTakaSign />
                      {book.price}
                    </div>
                  </div>
                ) : (
                  <div className="flex text-sm items-center gap-x-1">
                    <FaBangladeshiTakaSign />
                    {book.price}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
  );
};

export default RightPartProduct;