import React, { useContext, useEffect, useState } from 'react';
import Containar from "../../layouts/Containar";
import ProductItem from "../productitem/ProductItem";
import { FiPlus, FiMinus } from "react-icons/fi";
import { categoryList } from "../constants";
import * as Slider from "@radix-ui/react-slider";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import ApiContext from "../baseapi/BaseApi";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlices';

const colorList = [
  { name: "Brown" },
  { name: "Burgundy" },
  { name: "Charcoal" },
  { name: "Coral Red" },
  { name: "Creamy" },
  { name: "Crimson" },
  { name: "Gray" },
  { name: "Green" },
  { name: "Navy" },
  { name: "Palm" },
  { name: "Red" },
  { name: "Sky Blue" },
  { name: "Yellow" },
];

const ShopProducts = () => {
  const baseApi = useContext(ApiContext);
  const [allProduct, setAllProduct] = useState([]);
  const [allcategory, setAllCategory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('');
  const [categoryActive, setCategoryActive] = useState(true);
  const [brandActive, setBrandActive] = useState(true);
  const [colorActive, setColorActive] = useState(true);
  const [priceActive, setPriceActive] = useState(true);
  const [sliderValue, setSliderValue] = useState([0, 1000000]); // Default slider range
  const [filterPriceValue, setFilterPriceValue] = useState([0, 1000000]);
  const dispatch = useDispatch();
  // Handle slider value change
  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  // Fetch products from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
      
        const response = await axios.get(`${baseApi}/varient`);
        // console.log("Fetched Products:", response.data.data.variants);
        setAllProduct(response.data.data.variants);
      } catch (err) {
        setError(err);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterPriceValue, sortOption, baseApi]);

  // Fetch categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApi}/category`);
        setAllCategory(response.data.data.doc);
      } catch (err) {
        setError(err);
        console.error("Error fetching categories:", err);
      }
    };

    fetchData();
  }, [baseApi]);

  // Handle sort option change
  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortOption(value === 'low-to-high' ? 'price' : value === 'high-to-low' ? '-price' : '');
  };

  // Update price filter when slider value changes
  // useEffect(() => {
  //   console.log("Slider Value Changed:", sliderValue);
  //   setFilterPriceValue(sliderValue);
  // }, [sliderValue]);

  // Apply filter and sorting when filterPriceValue changes
  const handleFilterClick = () => {
    // This will trigger the useEffect to fetch filtered and sorted data
    setFilterPriceValue(sliderValue);
  };




  return (
    <section className="font-inter scroll-smooth">
      <Containar>
        <div className="flex flex-wrap justify-between mt-14 mb-14">
          <div className="w-[22%]">
            {/* Category Filter Part Start */}
            <div className="category">
              <div className="border-x border-t border-x-border border-b border-b-border border-t-border">
                <div onClick={() => setCategoryActive(!categoryActive)} className="flex justify-between cursor-pointer items-center px-6 py-5">
                  <h3 className="text-lg font-medium">Categories</h3>
                  <h3 className="text-2xl">{categoryActive ? <FiMinus /> : <FiPlus />}</h3>
                </div>
                <div className={`transition-all duration-500 ease-linear overflow-hidden ${categoryActive ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                  {categoryActive && (
                    <ul className="pb-4 px-6">
                      {allcategory.map((item) => (
                        <li className="py-2 text-sm text-texthead hover:text-danger cursor-pointer" key={item._id}>
                          {item?.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Brand Filter Part Start */}
            <div className="brand">
              <div className="border-x b border-x-border border-b border-b-border">
                <div onClick={() => setBrandActive(!brandActive)} className="flex justify-between cursor-pointer items-center px-6 py-5">
                  <h3 className="text-lg font-medium">Brand</h3>
                  <h3 className="text-2xl">{brandActive ? <FiMinus /> : <FiPlus />}</h3>
                </div>
                <div className={`transition-all duration-500 ease-linear overflow-hidden ${brandActive ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                  {brandActive && (
                    <ul className="pb-4 px-6">
                      {categoryList.map((item, index) => (
                        <li className="py-2 text-sm text-texthead hover:text-danger cursor-pointer" key={index}>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Color Filter Part Start */}
            <div className="Color">
              <div className="border-x b border-x-border border-b border-b-border">
                <div onClick={() => setColorActive(!colorActive)} className="flex justify-between cursor-pointer items-center px-6 py-5">
                  <h3 className="text-lg font-medium">Color</h3>
                  <h3 className="text-2xl">{colorActive ? <FiMinus /> : <FiPlus />}</h3>
                </div>
                <div className={`transition-all duration-500 ease-linear overflow-hidden ${colorActive ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                  {colorActive && (
                    <ul className="pb-4 px-6">
                      {colorList.map((item, index) => (
                        <li className="py-2 text-sm text-texthead hover:text-danger cursor-pointer" key={index}>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Price Filter Part Start */}
            <div className="Price">
              <div className="border-x b border-x-border border-b border-b-border">
                <div onClick={() => setPriceActive(!priceActive)} className="flex justify-between cursor-pointer items-center px-6 py-5">
                  <h3 className="text-lg font-medium">Filter by price</h3>
                  <h3 className="text-2xl">{priceActive ? <FiMinus /> : <FiPlus />}</h3>
                </div>
                <div className={`transition-all duration-500 ease-linear overflow-hidden ${priceActive ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-6 pb-10 mt-1">
                    <form>
                      <Slider.Root 
                        className="relative flex items-center select-none touch-none w-full h-7" 
                        value={sliderValue} 
                        max={1000000} 
                        min={0} 
                        step={1} 
                        onValueChange={handleSliderChange} 
                        minStepsBetweenThumbs={1}
                      >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[5px]">
                          <Slider.Range className="absolute bg-texthead rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-5 h-5 cursor-e-resize bg-texthead shadow-[0_2px_10px] shadow-blackA4 rounded-[10px] focus:outline-none border-[2px] border-white" aria-label="Volume" />
                        <Slider.Thumb className="block w-5 h-5 cursor-e-resize bg-texthead shadow-[0_2px_10px] shadow-blackA4 rounded-[10px] focus:outline-none border-[2px] border-white" aria-label="Volume" />
                      </Slider.Root>
                    </form>
                    <div className="mt-4 flex gap-x-3 items-center">
                      <button onClick={handleFilterClick} className="px-5 py-1.5 text-white bg-danger">
                        Filter
                      </button>
                      <div>
                        <h4 className="text-sm text-texthead flex gap-x-0.5">
                          Price:{" "}
                          <span className="flex items-center pl-0.5">
                            <FaBangladeshiTakaSign />
                            {sliderValue[0]}
                          </span>{" "}
                          -{" "}
                          <span className="flex items-center">
                            <FaBangladeshiTakaSign />
                            {sliderValue[1]}
                          </span>
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[75.6%]">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-base text-texthead">Showing {allProduct.length} Results</h3>
                <select className="px-3 py-2 border-b text-texthead border-b-border hover:border-texthead" defaultValue="" onChange={handleSortChange}>
                  <option className="text-sm" value="">
                    Default sorting
                  </option>
                  <option className="text-sm" value="popularity">
                    Sort by popularity
                  </option>
                  <option className="text-sm" value="latest">
                    Sort by latest
                  </option>
                  <option className="text-sm" value="low-to-high">
                    Sort by price: low to high
                  </option>
                  <option className="text-sm" value="high-to-low">
                    Sort by price: high to low
                  </option>
                </select>
              </div>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div>Error: {error.message}</div>
              ) : (
                <div className="flex flex-wrap mt-7">
                  {allProduct.map((item) => (
                    <ProductItem
                      key={item?._id}
                      product={item}
                      image={"https://img.freepik.com/free-photo/3d-cosmetic-product-with-color-year-tones_23-2151510140.jpg?t=st=1722235086~exp=1722238686~hmac=73b6b1726ef6d55153b0b50b1afef5aa8a906df4950ddcad7991608950efe527&w=1060"}
                      id={item._id}
                      subtitle={item?.product.title}
                      title={item?.title}
                      ownerName={item?.product?.category?.title}
                      offerprice={item?.price}
                      regularprice={item?.price}
                      classItem="w-1/4"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Containar>
    </section>
  );
};

export default ShopProducts;
