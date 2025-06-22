import React from 'react'
import 'remixicon/fonts/remixicon.css'
import { RainbowButton } from "../ui/rainbow-button";
import Link from "next/link";
import SolanaAddressButton from "../ui/solana-address-button";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center mx-4 md:mx-16 lg:mx-32 3xl:mx-36 py-6">
      <div className="text-xl flex justify-center space-x-12 font-inter items-center">
        <div className='flex items-center space-x-3 font-bold'>
            <img src="/logo.png" alt="SAGE Logo" className="sm:h-9 sm:w-9 xss:h-4 xss:w-5 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
            <h2 className='sm:text-[1rem] xss:text-[0.95rem] leading-5 font-medium'>SAGE</h2>
        </div>
        {/* <h3 className='text-[0.9rem] leading-5 text-[#dadada]'>Features</h3>
        <h3 className='text-[0.9rem] leading-5 text-[#dadada]'>Contact</h3>
        <h3 className='text-[0.9rem] leading-5 text-[#dadada]'>Features</h3> */}
      </div>
      <div className="space-x-3 font-inter font-medium">
        
        <SolanaAddressButton address="" />
        <Link href="https://x.com/sagewispro" target='_blank'>
          <RainbowButton>Twitter</RainbowButton>
        </Link>
      </div>
    </div>
  )
}

export default Navbar