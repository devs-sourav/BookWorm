import React, { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link } from "react-router-dom";

const MobileSearch = ({ toggleDrawer }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false); // State to control visibility of the list

  const searchRef = useRef(); // Create a ref for the entire search input and list container

  // Function to fetch products from the API
  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://bookwormm.netlify.app/api/v1/search`, {
        params: { query },
      });

      const variants = response.data?.data?.products || [];
      const validProducts = variants.filter(
        (product) => product?.variants?.[0]?.options?.[0]?.price > 0
      );
      setProducts(validProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when the search query changes
  useEffect(() => {
    if (search.length > 0) {
      fetchProducts(search);
      setShowList(true); // Show the product list when search is active
    } else {
      setProducts([]);
      setShowList(false); // Hide the product list when search is empty
    }
  }, [search]);

  // Filter products based on the search query
  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product?.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [products, search]);

  // Function to handle product click
  const handleProductClick = () => {
    setSearch("");
    setShowList(false); // Hide the list after clicking a product
  };

  // Handle clicks outside of the search input and product list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowList(false); // Hide the list if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative inline-block lg:hidden mt-2 mb-8">
      <input
        placeholder="Search products..."
        className="w-full bg-inputbg hover:border-texthead transition-all ease-linear duration-200 px-14 py-2.5 border outline-none border-border"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <CiSearch className="text-xl absolute left-4 top-1/2 -translate-y-1/2" />
      {search && showList && (
        <div className="absolute w-full z-20 bg-white border border-border mt-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-center">Loading...</div>
          ) : (
            <ul>
              {filteredProducts.length > 0
                ? filteredProducts.map((product, index) => (
                    <li
                      key={product.id}
                      className={`px-4 py-4 ${
                        filteredProducts.length === index + 1
                          ? "border-none"
                          : "border-b border-b-border"
                      } hover:bg-gray-200 cursor-pointer`}
                      onClick={() => {
                        handleProductClick();
                        toggleDrawer();
                      }}
                    >
                      <Link
                        className="flex items-center gap-x-2.5"
                        to={`/productdetail/${product._id}`}
                      >
                        <div className="w-10 h-10">
                          <img
                            className="w-full h-full object-contain"
                            src={product?.photos[0]}
                            alt={product?.name}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm">{product?.name}</h3>
                          <p className="flex items-center gap-x-1 mt-0.5">
                            <FaBangladeshiTakaSign className="text-xs" />
                            <span className="text-xs">
                              {product?.variants[0]?.options[0]?.price}
                            </span>
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                : !loading && <li className="px-4 py-2">No products found</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileSearch;
