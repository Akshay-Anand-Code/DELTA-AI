"use client";
import React, { useState } from "react";

const SolanaAddressButton = ({ address }) => {
  const [copied, setCopied] = useState(false);

  // Function to shorten the address for display
  const shortenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Function to copy the full address to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className="md:px-6 md:py-2 xs:px-3.5 xs:py-1.5 xss:px-3 xss:py-1.5 hover:scale-105 bg-[#212121] rounded-md border border-[#383838] hover:bg-[#2a2a2a] transition-all inline-flex items-center"
    >
      <i className="ri-file-copy-line text-[#c69326] mr-2 text-sm"></i>
      <span className="text-[#e2e2e2] text-xs tracking-wide font-mono">
        {shortenAddress(address)}
      </span>
      {copied && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded">
          Copied!
        </span>
      )}
    </button>
  );
};

export default SolanaAddressButton; 