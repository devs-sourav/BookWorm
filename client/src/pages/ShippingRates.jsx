import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const ShippingRates = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <BradCumbs title={"Shipping rates & Policy"} />

      <div className=" bg-gray-200  py-20 px-4 sm:px-6 lg:px-8">
        <Containar className={"flex items-center justify-center"}>
          {/* <div className="w-[600px] bg-white px-8 py-14 shadow-lg rounded-lg">
            <h2 className="text-center text-2xl font-extrabold text-gray-900">
              Shipping Rates & Policies
            </h2>
            <p className="mt-4 text-gray-700">
              We offer competitive shipping rates based on your location:
            </p>
            <div className="mt-6">
              <div className="flex justify-between items-center border-b border-gray-200 py-2">
                <span className="text-gray-900 font-medium">Inside Dhaka</span>
                <span className="text-green-600 font-bold">70 TK</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-2">
                <span className="text-gray-900 font-medium">Outside Dhaka</span>
                <span className="text-green-600 font-bold">140 TK</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">
                Shipping Policies
              </h3>
              <p className="mt-2 text-gray-700">
                All orders are processed outside of Dhaka within 2-3 business
                days and inside of Dhaka within 24 hours. Orders are not shipped
                or delivered on weekends or holidays.
              </p>
            </div>
          </div> */}
          <div className="max-w-4xl mx-auto bg-white p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Shipping Rates
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">1. Within Dhaka City</h3>
              <p className="text-gray-700">
                A flat shipping rate of{" "}
                <span className="font-semibold">70 BDT</span> applies to all
                orders delivered within Dhaka City. This allows our customers in
                the capital to enjoy fast and affordable delivery.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">
                2. Dhaka Suburban Areas
              </h3>
              <p className="text-gray-700">
                For areas surrounding Dhaka but outside the main city limits,
                the shipping charge is{" "}
                <span className="font-semibold">100 BDT</span>. This rate is
                designed to cover the additional logistical requirements for
                delivering to suburban regions.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">
                3. Other Districts in Bangladesh
              </h3>
              <p className="text-gray-700">
                For all other districts across Bangladesh, the shipping fee is{" "}
                <span className="font-semibold">140 BDT</span>. This flat rate
                ensures that customers from all over the country can shop
                without worrying about varying delivery charges.
              </p>
            </div>

            <h2 className="text-xl font-semibold mt-10 mb-4 text-center">
              Shipping Policy
            </h2>

            <ul className="list-disc pl-6 text-gray-700 space-y-4">
              <li>
                <strong>Shipping Charges:</strong> The shipping rates mentioned
                above are fixed and will be automatically applied at checkout
                based on your delivery location. These rates are non-negotiable
                and apply to all orders regardless of size or weight.
              </li>
              <li>
                <strong>Multiple Items:</strong> If your order includes multiple
                items, the shipping fee will remain the same as per the delivery
                location. There are no additional charges for extra items in a
                single order.
              </li>
              <li>
                <strong>Free Shipping Offers:</strong> Occasionally, bookworm
                may offer free shipping promotions for certain products or
                during special events. The terms and conditions of such offers
                will be mentioned on our website during the promotion period.
              </li>
              <li>
                <strong>Changes in Shipping Address:</strong> Once an order is
                placed, the shipping address cannot be changed. Please ensure
                your address details are accurate before completing your
                purchase.
              </li>
              <li>
                <strong>Undeliverable Packages:</strong> If a package is deemed
                undeliverable due to an incorrect address or other issues
                provided by the customer, additional shipping charges may apply
                for re-delivery. bookworm reserves the right to cancel orders
                where delivery is not possible due to logistical constraints.
              </li>
              <li>
                <strong>International Shipping:</strong> Currently, bookworm
                does not offer international shipping. All orders are delivered
                within Bangladesh only.
              </li>
              <li>
                <strong>Liability:</strong> bookworm is not liable for any
                delays or losses caused by circumstances beyond our control,
                such as natural disasters, strikes, or transportation issues.
              </li>
            </ul>

            <div className="mt-6 text-center">
              <p>
                We are committed to offering a clear and hassle-free shipping
                experience to our customers. Thank you for shopping with
                bookworm.
              </p>
            </div>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default ShippingRates;
