// src/components/RefundsAndReplacements.js

import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";
import { Link } from "react-router-dom";

const RefundsAndReplacements = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <BradCumbs title={"Refunds and replacements"} />
      <div className=" bg-gray-200  py-20 px-4 sm:px-6 lg:px-8">
        <Containar className={"flex  justify-center"}>
          {/* <div className=" max-w-4xl bg-white px-8 py-12 shadow-lg rounded-lg">
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Refund Policy
                </h3>
                <p className="mt-2 text-gray-700">
                  If you are not completely satisfied with your purchase, you
                  may request a refund within 3 days of receiving your order.
                  Items must be returned in their original condition, unused,
                  and with all original packaging and tags.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  How to Request a Refund
                </h3>
                <p className="mt-2 text-gray-700">
                  To initiate a refund, please contact our customer service team
                  at{" "}
                  <Link
                    to={"mailto:bookworm.query@gmail.com"}
                    className="text-blue-500 underline ml-0.5"
                  >
                    bookworm.query@gmail.com
                  </Link>{" "}
                  or call us at{" "}
                  <Link
                    to="tel:017 8050 8545"
                    className="text-blue-500 underline ml-0.5"
                  >
                   01629-169610
                  </Link>
                  . Provide your order number and a brief description of the
                  issue.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Replacement Policy
                </h3>
                <p className="mt-2 text-gray-700">
                  If you receive a defective or damaged item, we will gladly
                  provide a replacement. Please contact our support team within
                  3 days of receiving your order to request a replacement.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  How to Request a Replacement
                </h3>
                <p className="mt-2 text-gray-700">
                  To request a replacement, email us at
                  <Link
                    to={"mailto:bookworm.query@gmail.com"}
                    className="text-blue-500 underline ml-0.5"
                  >
                    bookworm.query@gmail.com
                  </Link>{" "}
                  with your order number, a description of the issue, and photos
                  of the damaged or defective item.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-900">
                  Processing Times
                </h3>
                <p className="mt-2 text-gray-700">
                  Refunds are typically processed within 5-7 business days after
                  we receive the returned item. Replacements are shipped within
                  3-5 business days of approval.
                </p>
              </section>
            </div>
          </div> */}
          <div className="max-w-4xl bg-white mx-auto p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Understanding Our Refunds Policy
            </h2>
            <p className="text-gray-700 mb-6">
              At bookworm, we are committed to ensuring your satisfaction with
              every purchase. However, our policy on refunds and replacements is
              clearly defined to streamline the process and maintain
              transparency.
            </p>

            <h3 className="text-lg font-bold mb-3">Refund Policy</h3>
            <p className="text-gray-700 mb-6">
              Please note that we do not offer refunds for products purchased
              through any of our ordering channels. We strive to provide clear
              and accurate product information to help you make informed
              decisions.
            </p>

            <h3 className="text-lg font-bold mb-3">Replacement Policy</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-4">
              <li>
                <strong>Eligibility:</strong> If you receive a damaged or
                incorrect product, we will replace it at no additional delivery
                cost.
              </li>
              <li>
                <strong>Inspection:</strong> It is essential to inspect the
                product in the presence of the delivery person upon receipt. Any
                issues with the product must be reported immediately at the time
                of delivery.
              </li>
              <li>
                <strong>Post-Delivery Complaints:</strong> Once the delivery
                person leaves, we cannot accept any complaints or process any
                replacements. Therefore, please ensure you check the product
                thoroughly before confirming receipt.
              </li>
            </ul>

            <h3 className="text-lg font-bold mb-3">
              How to Request a Replacement
            </h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-4">
              <li>
                <strong>Inspect the Product:</strong> Verify the condition of
                the product and check for any discrepancies or damage while the
                delivery person is still present.
              </li>
              <li>
                <strong>Report Issues:</strong> Inform the delivery person of
                any issues or errors immediately to initiate a replacement
                request.
              </li>
              <li>
                <strong>Contact Us:</strong> If you encounter any problems,
                contact our customer service team at{" "}
                <a
                  href="mailto:bookworm.query@gmail.com"
                  className="text-blue-500"
                >
                  bookworm.query@gmail.com
                </a>{" "}
                within the delivery time to facilitate a prompt resolution.
              </li>
            </ol>

            <p className="mt-6 text-center">
              We are dedicated to providing you with high-quality products and
              excellent service. Your understanding and cooperation with our
              policies help us serve you better.
            </p>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default RefundsAndReplacements;
