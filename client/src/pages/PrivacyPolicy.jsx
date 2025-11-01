import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BradCumbs title="Privacy Policy" />
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-200">
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 text-center">
            Your Privacy is Our Priority
          </h1>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            At <span className="font-semibold">bookworm</span>, we take your
            personal information seriously and are committed to protecting it.
            This Privacy Policy explains how we collect, use, and store your
            data and our stance on not sharing personal information.
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We collect your name, email address, phone number, and shipping
              address when you place an order. Payment details are processed
              through trusted payment gateways. We also collect browsing
              information to improve your shopping experience.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Your information is used to process orders, provide customer
              support, and improve our services. We may also use your data to
              send you updates on promotions and new products, but only with
              your consent.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Information Sharing
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We do not share your personal information with third parties for
              their marketing purposes. Your data may be shared with trusted
              service providers who help us process orders and manage payments,
              but these partners are required to protect your information and
              use it only for the intended purposes. We do not share your
              personal information with family members or external entities.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We have implemented robust security measures to protect your
              information from unauthorized access or disclosure. However, no
              method of electronic transmission or storage is 100% secure.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              You can access, update, or opt out of promotional communications
              at any time. For any questions or concerns about this policy or
              your personal information, please email us at{" "}
              <a
                href="mailto:bookworm.query@gmail.com"
                className="text-blue-600 hover:underline"
              >
                bookworm.query@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We may update this policy from time to time. Any changes will be
              posted on this page, so please review it regularly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
