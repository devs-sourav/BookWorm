import React, { useEffect } from "react";
import Containar from "../layouts/Containar";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import AccordianBox from "../components/faq/AccordianBox";

const shoppingFaqs = [
  {
    title: "How do I place an order?",
    para: "To place an order on bookworm, simply browse our product categories, select the items you wish to purchase, and add them to your cart. Once you’re ready, proceed to checkout, enter your shipping information, and choose your payment method. Confirm your order, and you’ll receive an email confirmation with your order details.",
  },
  {
    title: "Do I need to create an account to make a purchase?",
    para: "No, creating an account is optional. You can place an order as a guest without registering. However, creating an account can provide additional benefits such as faster checkout and order tracking.",
  },
  {
    title: "What are the shipping charges?",
    para: "Shipping charges vary based on your location: - Within Dhaka City: 70 BDT - Dhaka Suburban Areas: 100 BDT - Other Districts in Bangladesh: 140 BDT",
  },
  {
    title: "Can I change my shipping address after placing an order?",
    para: "Unfortunately, once an order is placed, the shipping address cannot be changed. Please ensure your address is accurate before completing your purchase.",
  },
  {
    title: "How can I track my order?",
    para: "Once your order is dispatched, you will receive an email with tracking information. You can use this tracking number to monitor your order’s status on the courier's website.",
  },
  {
    title: "What should I do if I receive a damaged or incorrect item?",
    para: "If you receive a damaged or incorrect item, please contact our customer service team immediately with your order number and photos of the item. We will arrange for a replacement of the product at no additional delivery charge. Please note that refunds are not provided for damaged or incorrect items; only exchanges are available under these circumstances.",
  },
];

const paymentFaqs = [
  {
    title:
      "Can I place an order without paying the delivery charge in advance?",
    para: "Yes, you can place an order without paying the delivery charge in advance. We do not require advance payment for delivery charges. You have the option to pay the total amount, including the delivery charge, upon receiving the product.",
  },
  {
    title: "Do you offer international shipping?",
    para: "Currently, bookworm only offers shipping within Bangladesh. We do not provide international shipping at this time.",
  },
  {
    title: "Can I cancel or modify my order after it has been placed?",
    para: "Once an order is placed and confirmed, it cannot be modified or canceled. Please review your order carefully before finalizing your purchase.",
  },
  {
    title: "Are there any ongoing promotions or discounts?",
    para: "We occasionally offer promotions and discounts on various products. To stay updated on our latest offers, please visit our Facebook page or check the announcements on the homepage of our website.",
  },
  {
    title: "What is your return policy?",
    para: "For information on returns and refunds, please refer to our Return Policy section on the website. Ensure to review the guidelines for returning items before initiating a return request.",
  },
];

const Faq = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BradCumbs title={"Frequently Asked Questions"} />
      <div className="pb-10">
        <AccordianBox accordianList={shoppingFaqs} heading="Shopping" />
      </div>
      <div className="pb-20">
        <AccordianBox
          accordianList={paymentFaqs}
          heading="Payment & Delivery"
        />
      </div>
    </>
  );
};

export default Faq;
