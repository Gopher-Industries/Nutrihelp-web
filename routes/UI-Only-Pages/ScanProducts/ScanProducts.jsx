import React, { useState } from 'react';
import './ScanProducts.css';
import SubHeading from '../../../components/general_components/headings/SubHeading';

function ScanProducts() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUploadChange = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
  };

  const handleImageUpload = async () => {
    try {
      // Create FormData object to send image file
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      // Make POST request to backend API
      const response = await fetch('http://localhost:80/api/imageClassification', {
        method: 'POST',
        body: formData,
      });

      // Check the response status
      if (response.ok) {
        const data = await response.json();
        setPredictionResult(data.prediction);
      } else {
        alert('Failed to classify image. Please try again.');
      }
    } catch (error) {
      // Handle errors
      console.error('Error classifying image:', error.message);
      alert('Failed to classify image. An error occurred.');
    }
  };

  return (
    <div className="scan-products-container">
      <SubHeading text="Scan Products" />
      {/*Input Title*/}
      <div className="scan-products-segment">
        <div className="scan-products-form">
          <label className="scan-products-label">Title</label>
          <input
            className="scan-products-input"
            placeholder="Enter product title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/*Input Description*/}
        <div className="scan-products-form">
          <label className="scan-products-label">Description</label>
          <input
            className="scan-products-input"
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/*Select image*/}
        <div className="scan-products-form">
          <label className="scan-products-label">Image</label>
          <div className="upload-section">
            <label htmlFor="file-upload">
              <p>Drop your image here, or browse</p>
            </label>
            <input id="file-upload" type="file" onChange={handleFileUploadChange} />
            {uploadedImage && (
              <p className="file-name">
                {/*Displays if there is an image selected (displays the image name)*/}
                Image added: {uploadedImage.name}
              </p>
            )}
          </div>
        </div>

        {/*Upload button*/}
        <button className="upload-button" onClick={handleImageUpload}>
          Upload Image
        </button>
      </div>

      {/*Display Result*/}
      {predictionResult && (
        <div className="prediction-section">
          <h3 className="prediction-text">It is: {predictionResult}</h3>
        </div>
      )}
    </div>
  );
}

export default ScanProducts;
