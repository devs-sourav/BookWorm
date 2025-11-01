import React from 'react';

const SizeModal = ({ showModal, options, onClose, onSelectOption }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Select a Size</h2>
        <ul>
          {options?.map(option => (
            <li
              key={option._id}
              onClick={() => onSelectOption(option)}
              className="cursor-pointer p-2 border-b hover:bg-gray-200"
            >
              {option.size} - {option.salePrice || option.price} Tk
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 bg-danger text-white rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SizeModal;
