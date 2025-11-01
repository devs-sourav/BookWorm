import React from "react";

const OptionModal = ({ show, onClose, options }) => {
  if (!show) return null;

  console.log("options", options.options); // Check if options is being logged

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Select an Option</h2>
        <ul>
          {options?.options?.length > 0 ? (
            options?.options?.map((option) => (
              <li key={option._id} className="mb-2">
                <div className="flex justify-between">
                  <span>Size: {option?.size}</span>
                  {/* <span>Price: {option.salePrice || option.price}</span> */}
                </div>
              </li>
            ))
          ) : (
            <p>No options available</p>
          )}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-danger text-white rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OptionModal;
