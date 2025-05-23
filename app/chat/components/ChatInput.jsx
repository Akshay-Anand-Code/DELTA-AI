import ImageUpload from '../../../components/ImageUpload/ImageUpload';

const [uploadedImage, setUploadedImage] = useState(null);

const handleImageUploaded = (imageUrl) => {
  setUploadedImage(imageUrl);
};

<div className="flex items-center gap-2">
  <ImageUpload onImageUploaded={handleImageUploaded} />
  <textarea
    // your existing textarea props
  />
</div>

{uploadedImage && (
  <div className="relative mb-2">
    <img 
      src={uploadedImage} 
      alt="Uploaded" 
      className="max-h-40 rounded-md" 
    />
    <button
      onClick={() => setUploadedImage(null)}
      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
      title="Remove image"
    >
      <i className="ri-close-line text-white"></i>
    </button>
  </div>
)}

const handleSendMessage = () => {
  // Your existing code
  
  // Include the image in the message if one is uploaded
  if (uploadedImage) {
    // Add the image to your message content
    const messageWithImage = `![Uploaded Image](${uploadedImage})\n\n${message}`;
    // Use messageWithImage instead of message
    
    // Clear the uploaded image after sending
    setUploadedImage(null);
  }
  
  // Rest of your send message logic
}; 