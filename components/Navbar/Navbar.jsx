import React from 'react'
import 'remixicon/fonts/remixicon.css'
import { RainbowButton } from "../ui/rainbow-button";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center mx-4 md:mx-16 lg:mx-32 3xl:mx-36 py-6">
      <div className="text-xl flex justify-center space-x-12 font-inter items-center">
        <div className='flex items-center space-x-3 font-bold'>
            <img src="/logo.png" alt="CHASKA Logo" className="sm:h-9 sm:w-9 xss:h-4 xss:w-5 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
            <h2 className='sm:text-[1rem] xss:text-[0.95rem] leading-5 font-medium'>CHASKA</h2>
        </div>
        {/* <h3 className='text-[0.9rem] leading-5 text-[#dadada]'>Features</h3>
        <h3 className='text-[0.9rem] leading-5 text-[#dadada]'>Contact</h3>
        <h3 className='text-[0.9rem] leading-5 text-[#dadada]'>Features</h3> */}
      </div>
      <div className="space-x-3 font-inter font-medium">
        <Link href="/docs" className='md:px-6 md:py-2 xs:px-3.5 xs:py-1.5 xss:px-3 xss:py-1.5 hover:scale-105 xss:text-[1rem] hover:bg-[#161616] rounded-md transition-all ease-in-out'>Docs</Link>
        <Link href="https://google.com" target='_blank' className='md:px-6 md:py-2 xs:px-3.5 xs:py-1.5 xss:px-3 xss:py-1.5 hover:scale-105 xss:text-[1rem] hover:bg-[#161616] rounded-md transition-all ease-in-out'>Telegram</Link>
        {/* <button className='md:px-4 md:py-[0.37rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-black xss:text-[1rem] bg-[#efefef] hover:bg-[#fdfdfd] transition-all ease-in-out rounded-md '>Get Started</button> */}
        <Link href="https://google.com" target='_blank'>
          <RainbowButton>Twitter</RainbowButton>
        </Link>
      </div>
    </div>
  )
}

export default Navbar