// src/components/DeliveryInfo.js

import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import { Link } from "react-router-dom";
import Containar from "../layouts/Containar";

const DeliveryInfo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <BradCumbs title={"Delivery Information"} />
      <div className=" bg-gray-100 py-20 px-4 sm:px-6 lg:px-8">
        <Containar className={" flex items-center justify-center"}>
          {/* <div className="max-w-4xl w-full bg-white px-8 py-12 shadow-lg rounded-lg">
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Delivery Time
                </h3>
                <p className="mt-2 text-gray-700">
                  Orders are processed within 2-3 business days. Delivery times
                  may vary depending on the destination. Typically, deliveries
                  within Dhaka take 1-2 days, while deliveries outside Dhaka can
                  take 3-5 days.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Shipping Carriers
                </h3>
                <p className="mt-2 text-gray-700">
                  We partner with several carriers to ensure timely delivery of
                  your orders. Our main carriers include:
                </p>
                <ul className="list-disc pl-5 mt-2 text-gray-700">
                  <li>Carrier A</li>
                  <li>Carrier B</li>
                  <li>Carrier C</li>
                </ul>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Tracking Your Order
                </h3>
                <p className="mt-2 text-gray-700">
                  Once your order has been shipped, you will receive a
                  confirmation email with tracking information. You can track
                  your order using the tracking number provided in the email.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Delivery Charges
                </h3>
                <p className="mt-2 text-gray-700">
                  We offer competitive shipping rates. Please refer to our
                  <Link
                    to={"/shipingrates-policy"}
                    className="text-blue-500 underline"
                  >
                    {" "}
                    Shipping Rates & Policies
                  </Link>{" "}
                  page for detailed information.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Contact Us
                </h3>
                <p className="mt-2 text-gray-700">
                  If you have any questions regarding your delivery, please
                  contact our support team at
                  <Link
                    to={"mailto:bookworm.query@gmail.com"}
                    className="text-blue-500 underline ml-0.5"
                  >
                    bookworm.query@gmail.com
                  </Link>{" "}
                </p>
              </section>
            </div>
          </div> */}
          <div className="max-w-4xl bg-white shadow-lg mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Nationwide Home Delivery Service
            </h2>
            <p className="mb-6 text-lg text-gray-700">
              We are pleased to offer home delivery across Bangladesh. Enjoy the
              convenience of ordering from your home without any advance
              payment. You can pay the full amount upon receiving your product.
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">
                Delivery Timeframes
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  <strong>Dhaka City:</strong> We aim to deliver your order
                  within 24 hours.
                </li>
                <li>
                  <strong>Outside Dhaka:</strong> For deliveries throughout
                  Bangladesh, please expect your order to arrive within 2 to 3
                  business days.
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Delivery Partners</h3>
              <p className="text-gray-700">
                We use trusted courier services to ensure timely delivery:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Pathao</li>
                <li>RedX</li>
                <li>SteadFast Courier</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">
                Product Inspection and Returns
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  <strong>Inspection:</strong> Upon delivery, you have the
                  opportunity to inspect the product in the presence of the
                  delivery person.
                </li>
                <li>
                  <strong>Return Policy:</strong> If the product does not meet
                  your expectations, you may return it. However, a delivery
                  charge will apply for the return process. Please make sure to
                  check the product carefully before confirming receipt to avoid
                  any inconvenience.
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Important Notes</h3>
              <p className="text-gray-700">
                <strong>Natural Disasters and Unforeseen Circumstances:</strong>{" "}
                Delivery times may be impacted by natural disasters or adverse
                conditions. These delays are beyond our control, and we
                appreciate your patience during such events. We are committed to
                providing you with timely service and thank you for your
                understanding during any unforeseen delays.
              </p>
            </div>

            <p className="text-gray-700">
              For any questions or updates on your delivery, please contact us
              at{" "}
              <a
                href="mailto:bookworm.query@gmail.com"
                className="text-blue-500 underline"
              >
                bookworm.query@gmail.com
              </a>
              . We are here to assist you and ensure a smooth delivery
              experience.
            </p>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default DeliveryInfo;
