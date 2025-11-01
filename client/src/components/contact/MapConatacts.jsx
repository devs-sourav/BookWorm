import React from "react";

const MapConatacts = () => {
  return (
    <div className="">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29625.92372410076!2d90.3813707471827!3d23.73822714434507!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8f262ce64dd%3A0xfe38aea70ab8d329!2s73%20Kakrail%20Rd%2C%20Dhaka%201205!5e0!3m2!1sen!2sbd!4v1726747468308!5m2!1sen!2sbd"
        className="w-full h-[180px] sm:h-[300px] lg:h-[500px]"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default MapConatacts;
