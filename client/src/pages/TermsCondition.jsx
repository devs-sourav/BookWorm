import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const TermsCondition = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <BradCumbs title="Terms & Condition" />
      <div className="font-inter mb-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-200">
          <Containar>
            <div className="max-w-5xl mx-auto p-6 text-sm leading-relaxed bg-white">
              <h1 className="text-xl font-bold text-center mb-6">
                Terms and Conditions
              </h1>

              <p>
                Welcome to bookworm! By using our website, you agree to the
                following terms and conditions. Please read them carefully
                before making any purchases or using our services.
              </p>

              <h2 className="font-bold mt-4">1. Introduction</h2>
              <p>
                1.1 These terms and conditions outline the rules and regulations
                for using bookworm's website, located at mybookworm.com. By
                accessing this website, we assume you fully accept these terms
                and conditions. Only continue to use bookworm's website if you
                accept all of the terms and conditions stated on this page.
              </p>
              <p>
                1.2 The term ‘bookworm’ or ‘us’ or ‘we’ refers to the owner of
                the website. The term ‘you’ refers to the user or viewer of our
                website.
              </p>

              <h2 className="font-bold mt-4">2. Use of the Website</h2>
              <p>
                2.1 By accessing and using the bookworm website, you warrant
                that you are legally capable of entering into binding contracts
                and that you are at least the age of majority in your state or
                province of residence.
              </p>
              <p>
                2.2 You agree to use this website only for lawful purposes. You
                must not use this website in any way that causes or may cause
                damage to the website or impairment of the availability or
                accessibility of the website, or in any way which is unlawful,
                illegal, fraudulent, or harmful.
              </p>

              <h2 className="font-bold mt-4">
                3. Account Registration and Usage
              </h2>
              <p>
                3.1 Account Registration: Creating an account on bookworm is
                optional. You are not required to register or create an account
                to place an order or access our services. You can browse and
                purchase products as a guest without any restrictions.
              </p>
              <p>
                3.2 Guest Checkout: Customers have the option to proceed as a
                guest and make purchases without creating an account. All
                necessary information, such as shipping and payment details,
                must be provided at checkout.
              </p>
              <p>
                3.3 Account Benefits: Registered users may enjoy additional
                benefits such as faster checkout, order history tracking, and
                exclusive offers.
              </p>
              <p>
                3.4 Account Security: You are responsible for maintaining the
                confidentiality of your account and password. You agree to
                accept responsibility for all activities that occur under your
                account. bookworm reserves the right to terminate accounts,
                remove or edit content, or cancel orders at our discretion.
              </p>

              <h2 className="font-bold mt-4">
                4. Product Information and Accuracy
              </h2>
              <p>
                4.1 bookworm offers a wide range of products, with a focus on
                women's products, and endeavors to display accurate colors,
                features, and details of products. However, we do not guarantee
                perfect accuracy due to variations in your display.
              </p>
              <p>
                4.2 All products are subject to availability, and prices are
                subject to change.
              </p>

              <h2 className="font-bold mt-4">5. Pricing and Payment</h2>
              <p>
                5.1 All prices are in BDT and include taxes unless otherwise
                specified. Prices may change, but this will not affect accepted
                orders.
              </p>
              <p>
                5.2 Payment can be made through available methods, and in the
                case of incorrect pricing, we reserve the right to cancel orders
                and issue refunds.
              </p>

              <h2 className="font-bold mt-4">
                6. Order Acceptance and Cancellation
              </h2>
              <p>
                6.1 Your order is an offer, and we reserve the right to accept
                or cancel it based on product availability, errors, or suspected
                fraud. In case of cancellation, we will notify you and issue a
                refund.
              </p>

              <h2 className="font-bold mt-4">
                7. User Conduct and Obligations
              </h2>
              <p>
                7.1 You must not misuse the website for illegal activities,
                hacking, spamming, or spreading malware. Breaching this will
                lead to criminal action.
              </p>

              <h2 className="font-bold mt-4">
                8. Intellectual Property Rights
              </h2>
              <p>
                8.1 You are not allowed to republish, sell, rent, or
                redistribute content from bookworm without permission.
              </p>

              <h2 className="font-bold mt-4">9. Third-Party Links</h2>
              <p>
                9.1 Our website may link to third-party websites, which we do
                not control. bookworm is not responsible for content or damages
                from third-party links.
              </p>

              <h2 className="font-bold mt-4">10. Limitation of Liability</h2>
              <p>
                10.1 bookworm is not liable for special or consequential damages
                arising from using the site or products.
              </p>

              <h2 className="font-bold mt-4">11. Indemnification</h2>
              <p>
                11.1 You agree to indemnify bookworm for losses or damages due
                to a violation of these terms or wrongful use of the site.
              </p>

              <h2 className="font-bold mt-4">12. Changes to These Terms</h2>
              <p>
                12.1 bookworm reserves the right to modify terms and will notify
                you 30 days prior to material changes.
              </p>

              <h2 className="font-bold mt-4">13. Governing Law</h2>
              <p>
                13.1 These terms are governed by the laws of Bangladesh, and any
                disputes will be handled by courts in that jurisdiction.
              </p>

              <h2 className="font-bold mt-4">14. Return Policy</h2>
              <p>
                14.1 If a product does not meet your expectations, you may
                return it with applicable delivery charges. Please check the
                product carefully before confirming receipt.
              </p>

              <h2 className="font-bold mt-4">15. Contact Us</h2>
              <p>
                15.1 For any questions, contact us at bookworm.query@gmail.com
                or01629-169610.
              </p>
            </div>
          </Containar>
        </div>
      </div>
    </>
  );
};

export default TermsCondition;
