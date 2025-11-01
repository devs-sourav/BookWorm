import React, { useEffect, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import * as Slider from "@radix-ui/react-slider";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setPriceRange } from "../../redux/slices/priceRangeSlice";
import axios from "axios";

const PriceFilter = () => {
  const [priceActive, setPriceActive] = useState(true);
  const [maxPrice, setMaxPrice] = useState(300000); // fallback
  const dispatch = useDispatch();
  const priceRange = useSelector((state) => state.priceRange);

  const [sliderValue, setSliderValue] = useState([
    priceRange.minPrice,
    priceRange.maxPrice,
  ]);
  const [inputValue, setInputValue] = useState([
    priceRange.minPrice,
    priceRange.maxPrice,
  ]);

  // Fetch highest price from API
  useEffect(() => {
    const fetchHighestPrice = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/product/stats/highest-price"
        );
        if (res.data.success && res.data.highestPrice) {
          setMaxPrice(res.data.highestPrice+500);
          setSliderValue([priceRange.minPrice, res.data.highestPrice+500]);
          setInputValue([priceRange.minPrice, res.data.highestPrice+500]);
        }
      } catch (err) {
        console.error("Failed to fetch highest price:", err);
      }
    };
    fetchHighestPrice();
  }, []);

  // Real-time slider change
  const handleSliderChange = (value) => {
    setSliderValue(value);
    setInputValue(value);
    dispatch(setPriceRange(value));
  };

  // Real-time input change
  const handleInputChange = (index, value) => {
    const updated = [...inputValue];
    updated[index] = Number(value) || 0;

    // Clamp values within range
    let minVal = Math.max(0, Math.min(updated[0], maxPrice));
    let maxVal = Math.max(minVal, Math.min(updated[1], maxPrice));

    setInputValue([minVal, maxVal]);
    setSliderValue([minVal, maxVal]);
    dispatch(setPriceRange([minVal, maxVal]));
  };

  return (
    <div className="Price scroll-smooth bg-white">
      <div className="border-x b border-x-border border-b border-b-border">
        <div
          onClick={() => setPriceActive(!priceActive)}
          className="flex justify-between cursor-pointer items-center px-6 py-5"
        >
          <h3 className="text-lg font-medium">Filter by price</h3>
          <h3 className="text-2xl">{priceActive ? <FiMinus /> : <FiPlus />}</h3>
        </div>

        <div
          className={`transition-all duration-500 ease-linear overflow-hidden ${
            priceActive ? "max-h-[250px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-10 mt-1">
            {/* Slider */}
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-7"
              value={sliderValue}
              max={maxPrice}
              min={0}
              step={1}
              onValueChange={handleSliderChange}
              minStepsBetweenThumbs={0}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-[5px]">
                <Slider.Range className="absolute bg-texthead rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 cursor-e-resize bg-texthead rounded-[10px] border-[2px] border-white" />
              <Slider.Thumb className="block w-5 h-5 cursor-e-resize bg-texthead rounded-[10px] border-[2px] border-white" />
            </Slider.Root>
            {/* Current Price */}
            <div className="mt-4 text-sm text-texthead">
              Current: <FaBangladeshiTakaSign className="inline" />{" "}
              {sliderValue[0]} - <FaBangladeshiTakaSign className="inline" />{" "}
              {sliderValue[1]}
            </div>
            {/* Min/Max Inputs */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center border px-2 py-1">
                <FaBangladeshiTakaSign className="text-gray-500" />
                <input
                  type="number"
                  value={inputValue[0]}
                  onChange={(e) => handleInputChange(0, e.target.value)}
                  className="w-20 outline-none text-sm pl-1"
                  min={0}
                  max={maxPrice}
                />
              </div>
              <span>-</span>
              <div className="flex items-center border px-2 py-1">
                <FaBangladeshiTakaSign className="text-gray-500" />
                <input
                  type="number"
                  value={inputValue[1]}
                  onChange={(e) => handleInputChange(1, e.target.value)}
                  className="w-20 outline-none text-sm pl-1"
                  min={0}
                  max={maxPrice}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
