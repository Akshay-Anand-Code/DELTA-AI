import React from "react";

const Footer = () => {
  return (
    <div className="w-full flex flex-col xss:items-center sm:flex-row sm:justify-between mt-[10rem] border-t py-10">
      <div className="xss:mb-8 sm:mb-0 xss:text-center sm:text-left">
        <div className="flex xss:justify-center sm:justify-start items-center space-x-1.5 font-bold">
          {/* <i className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm"></i> */}
          <img src="/logo.png" alt="Delta Vision Logo" className="sm:h-9 sm:w-9 xss:h-4 xss:w-5 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
          <h2 className="text-[1.5rem] text-[#FFFFFF] leading-5 font-bold">
            Delta Vision
          </h2>
        </div>
        {/* <p className="text-sm mt-4 font-inter text-[#e9e9e9]">
          Made by{" "}
          <a
            target="_blank"
            href="https://github.com/SiddDevZ"
            className="font-medium underline decoration-[#a9a9a9] transition-all hover:decoration-white"
          >
            Siddharth Meena
          </a>{" "}
          ❤️
        </p> */}
      </div>
      <div className="flex xss:justify-center sm:justify-start items-center space-x-3 text-sm">
        <a href="https://twitter.com/YourTwitterHandle" target="_blank" rel="noopener noreferrer" className="ri-twitter-fill sm:text-[2.2rem] xss:text-[2rem] text-black dark:text-white transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer"></a>
        <a href="mailto:your.email@example.com" className="ri-mail-line sm:text-[2.2rem] xss:text-[2rem] text-black dark:text-white transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer"></a>
        <a href="https://t.me/YourTelegramUsername" target="_blank" rel="noopener noreferrer" className="ri-telegram-fill sm:text-[2.2rem] xss:text-[2rem] text-black dark:text-white transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer"></a>
      </div>
    </div>
  );
};

export default Footer;