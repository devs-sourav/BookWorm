import React from 'react'
// max-w-8xl

const Containar = ({children,className}) => {
  return (
    <div className={` container mx-auto ${className}`}>{children}</div>
  )
}

export default Containar