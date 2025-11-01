// DesktopSearch.jsx
import React, { useRef, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";

export default function DesktopSearch({
  isSearchOpen,
  setIsSearchOpen,
  searchValue,
  setSearchValue,
  handleSearchEnter,
}) {
  const searchRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <div ref={searchRef} className="relative transition-all duration-300">
      <div
        className={`flex items-center bg-white rounded px-2 py-1.5 cursor-pointer ${
          isSearchOpen ? "w-[400px]" : "w-10"
        } transition-all duration-300 ease-in-out`}
        onClick={() => setIsSearchOpen(true)}
      >
        <SearchIcon className="w-6 h-6 text-black" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchEnter}
          placeholder="Search..."
          className={`ml-2 text-black outline-none bg-transparent w-full ${
            isSearchOpen ? "block" : "hidden"
          }`}
          autoFocus={isSearchOpen}
        />
      </div>
    </div>
  );
}
