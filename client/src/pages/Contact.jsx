import React, { useEffect } from 'react'
import MapConatacts from '../components/contact/MapConatacts'
import ContactInfo from '../components/contact/ContactInfo'
import BradCumbs from '../components/bradcumbs/BradCumbs'

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
        <BradCumbs title={"Contact Us"}/>
        <MapConatacts/>
        <ContactInfo/>
    </>
  )
}

export default Contact