import React, { useState, useEffect } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import ProductItem from "../productitem/ProductItem";
import { Link } from "react-router-dom";

const filterlist = [
  {
    name: "Featured",
    active: true,
  },
  {
    name: "On Sale",
    active: false,
  },
  {
    name: "Most Viewed",
    active: false,
  },
];

const apiUrls = {
  Featured: "https://bookwormm.netlify.app/api/v1/product",
  "On Sale": "https://bookwormm.netlify.app/api/v1/product?sort=saleNumber",
  "Most Viewed": "https://bookwormm.netlify.app/api/v1/product?sort=visitCount",
};

const SaleFeature = () => {
  const [select, setSelect] = useState(filterlist);
  const [currentList, setCurrentList] = useState([]);

  useEffect(() => {
    fetchData("Featured");
  }, []);

  const fetchData = async (filterName) => {
    const apiUrl = apiUrls[filterName] || apiUrls["Featured"];
    try {
      const response = await axios.get(apiUrl);
      const fetchedProducts = response.data.data.doc; // This is the array of books/products

      // Remove duplicates based on product ID
      const uniqueProducts = [];
      const seenProductIds = new Set();
      fetchedProducts.forEach((item) => {
        if (!seenProductIds.has(item._id)) {
          seenProductIds.add(item._id);
          uniqueProducts.push(item);
        }
      });

      setCurrentList(uniqueProducts.reverse().slice(0, 12));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSelect = (name) => {
    const updatedList = select.map((item) =>
      item.name === name
        ? { ...item, active: true }
        : { ...item, active: false }
    );
    setSelect(updatedList);
    fetchData(name);
  };

  return (
    <div className="pt-14 lg:pt-28 font-inter">
      <Containar>
        <h2 className="text-center text-[26px] lg:text-head text-texthead font-medium">
          Featured Products
        </h2>
        <div className="mt-7 lg:mt-10 w-full flex justify-center">
          <ul className="flex gap-x-10 lg:gap-x-20">
            {select.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelect(item?.name)}
                className={`${
                  item.active
                    ? 'text-base font-medium text-texthead relative before:content-[""] before:absolute before:-bottom-3.5 before:left-0 before:w-full before:h-[1px] before:bg-texthead cursor-pointer '
                    : 'text-base text-paracolor font-medium hover:text-texthead cursor-pointer relative before:content-[""] before:absolute before:-bottom-3.5 before:right-0 before:w-0 hover:before:left-0 transition-all before:transition-all  before:ease-linear before:duration-200  hover:before:w-full before:h-[1px] before:bg-texthead'
                }`}
              >
                {item?.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-12 mt-12 lg:mt-14">
          {currentList.map((item, index) => (
            <ProductItem
              key={item?._id}
              product={item}
              image={item?.photos}
              id={item?._id}
              subtitle={item?.brand?.title}
              title={item?.title}
              categoryId={item?.category?._id}
              brandId={item?.brand?._id}
              categoryName={item?.category?.title}
              discount={item?.discountValue}
              discountType={item?.discountType}
              discountPercent={item?.discountValue}
              priceAfterDiscount={item?.salePrice}
              offerprice={item?.price - (item?.discountType === 'amount' ? item?.discountValue : (item?.price * item?.discountValue / 100))}
              freeShipping={item?.freeShipping}
              regularprice={item?.price}
              classItem="col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-2"
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            to={"/shop"}
            className="mt-12 bg-gray-100 px-14 py-3 font-medium text-base rounded-md hover:bg-danger hover:text-white transition-all ease-linear duration-200"
          >
            Show All
          </Link>
        </div>
      </Containar>
    </div>
  );
};

export default SaleFeature;