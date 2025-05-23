"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';

const GhibliImageUpload = ({ onImageGenerated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert the file to a base64 string
      const base64Image = await convertToBase64(file);
      setUploadedImage(base64Image);

      // Now generate the Ghibli style image
      const ghibliResponse = await fetch('/api/image/ghibli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: base64Image })
      });

      if (!ghibliResponse.ok) {
        throw new Error('Failed to generate Ghibli style image');
      }

      const ghibliData = await ghibliResponse.json();
      
      if (ghibliData.url) {
        onImageGenerated(ghibliData.url);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="border border-[#acacac] hover:border-white hover:scale-[1.02] transition-all ease-in-out gap-2 flex items-center justify-center text-white font-inter w-full font-medium py-2.5 px-4 rounded-full duration-300"
      >
        {isUploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <i className="ri-image-add-line mr-2"></i>
            Upload Image for Ghibli Transformation
          </span>
        )}
      </button>
      
      {uploadedImage && (
        <div className="mt-4 w-full">
          <p className="text-sm text-gray-400 mb-2">Original Image:</p>
          <img 
            src={uploadedImage} 
            alt="Uploaded" 
            className="w-full h-auto rounded-md object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default GhibliImageUpload; 