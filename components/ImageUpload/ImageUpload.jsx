import React, { useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const ImageUpload = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if uploads are enabled
    if (process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'true') {
      toast.error('Image uploads are currently disabled');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    // Check file size
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE) || 10485760; // Default 10MB
    if (file.size > maxSize) {
      toast.error(`Image too large. Maximum size is ${Math.floor(maxSize / 1048576)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('token', Cookies.get('token'));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      toast.success('Image uploaded successfully');
      onImageUploaded(data.imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="flex items-center justify-center gap-2 text-white bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors rounded-full p-2"
        title="Upload image"
      >
        <i className="ri-image-add-line text-xl"></i>
        {isUploading && <span className="animate-spin">⟳</span>}
      </button>
    </div>
  );
};

export default ImageUpload; 