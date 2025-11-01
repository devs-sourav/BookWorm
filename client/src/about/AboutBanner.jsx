import React from 'react'
import about from "../assets/about/about.jpg"

const AboutBanner = () => {
  return (
    <div className='w-full h-[500px]'>
        <img className='w-full h-full object-cover' src={about}/>
    </div>
  )
}

export default AboutBanner