import React, { useEffect, useState } from "react";
import Containar from "../../layouts/Containar";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link } from "react-router-dom";
import product1 from "../../assets/bestsell/bestsell1.jpg";
import { useLocation } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";

const CartProductItem = ({productList}) => {
  const [quantity, setQuantity] = useState(1);
  return (
    // <div className="py-20 bg-primary font-inter">
    //     <div>
    //       <h2 className="text-3xl text-center font-medium text-texthead">
    //         Your Cart: <span>4</span> items
    //       </h2>
    //       <div className="mt-10 grid grid-cols-12 gap-x-8">
    //         <div className="col-span-9">
    //           <ul className="flex items-center px-8 h-20  bg-white border-b-2 border-b-border shadow-sm">
    //             <li className="w-[4%] text-base font-medium"></li>
    //             <li className="w-[40%] text-base font-medium">Product</li>

    //             <li className="w-[21%] text-base font-medium">Price</li>
    //             <li className="w-[25%] text-base font-medium">Quantity</li>
    //             <li className="w-[10%] text-base font-medium">Subtotal</li>
    //           </ul>

    //             <ul className="flex items-center py- px-8 py-5  bg-white ">
    //               <li className="w-[4%] text-xl hover:text-danger transition-all ease-linear font-medium cursor-pointer">
    //                 <RxCross2 />
    //               </li>
    //               <li className="w-[40%]  font-medium">
    //                 <div className="flex gap-x-4 items-center">
    //                   <div className="w-[90px]">
    //                     <img className="w-full object-contain" src={product1} />
    //                   </div>
    //                   <div>
    //                     <h3 className="text-base font-medium cursor-pointer hover:text-danger transition-all ease-linear duration-200 text-texthead">
    //                       <Link to={"/productdetail"}>
    //                         All You Can Ever Know: A Memoir
    //                       </Link>
    //                     </h3>
    //                     <p className="text-sm font-normal mt-2">Nicole Chung</p>
    //                   </div>
    //                 </div>
    //               </li>
    //               <li className="w-[21%] text-base font-medium">
    //                 <p className="flex items-center gap-x-1">
    //                   <span>
    //                     <FaBangladeshiTakaSign />
    //                   </span>
    //                   <span>10 </span>
    //                 </p>
    //               </li>
    //               <li className="w-[25%] text-base font-medium">
    //                 <div className="h-14 flex ">
    //                   <div className="border h-full flex items-center">
    //                     <div
    //                       onClick={() => {
    //                         quantity > 1 && setQuantity(quantity - 1);
    //                       }}
    //                       className="w-14 flex justify-center items-center cursor-pointer"
    //                     >
    //                       <h3 className="text-texthead text-sm ">
    //                         <FaMinus />
    //                       </h3>
    //                     </div>
    //                     <div className=" flex justify-center items-center">
    //                       <h3 className="text-texthead text-base px-3">
    //                         {quantity}
    //                       </h3>
    //                     </div>
    //                     <div
    //                       onClick={() => {
    //                         setQuantity(quantity + 1);
    //                       }}
    //                       className="w-14 flex justify-center items-center cursor-pointer"
    //                     >
    //                       <h3 className="text-texthead text-sm ">
    //                         <FaPlus />
    //                       </h3>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </li>
    //               <li className="w-[10%] text-base font-medium">
    //                 <p className="flex items-center gap-x-1">
    //                   <span>
    //                     <FaBangladeshiTakaSign />
    //                   </span>
    //                   <span>{10 * quantity}</span>
    //                 </p>
    //               </li>
    //             </ul>
    //           ))}

    //           <div className="mt-10">
    //             <div>
    //               <button className="px-8 py-3 bg-texthead hover:bg-black text-base font-medium border-b-border  text-white">
    //                 Reset Cart
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //         <div className="col-span-3">
    //           <div className="border border-texthead">
    //             <div className="flex h-20 border-b-2 bordere-b-border items-center font-medium px-8 text-texthead bg-white shadow-sm">
    //               <h3>Cart Totals</h3>
    //             </div>
    //             <div className="max-1000 px-8 py-8 bg-white">
    //               <div className="flex justify-between items-center">
    //                 <h3 className="text-sm font-medium text-texthead">
    //                   Subtotal
    //                 </h3>
    //                 <h3 className="text-sm font-medium text-texthead">$43</h3>
    //               </div>
    //               <div className="flex justify-between items-center mt-5">
    //                 <h3 className="text-sm font-medium text-texthead">US</h3>
    //                 <h3 className="text-sm font-medium text-texthead">$5</h3>
    //               </div>
    //               <div className="flex justify-between items-center mt-5">
    //                 <h3 className="text-sm font-medium text-texthead">
    //                   Shipping
    //                 </h3>
    //                 <h3 className="text-sm font-medium text-texthead">$10</h3>
    //               </div>
    //             </div>
    //             <div className="max-1000 px-8 py-8 bg-white border-t-2 border-t-border">
    //               <div className="flex justify-between items-center">
    //                 <h3 className="text-sm font-medium text-texthead">Total</h3>
    //                 <h3 className="text-sm font-medium text-texthead">$43</h3>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    // </div>
    <></>
  );
};

export default CartProductItem;
