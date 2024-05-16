import React, { useState } from 'react';
import './ScanProducts.css';
import SubHeading from '../../../components/general_components/headings/SubHeading';
import { Container, Segment, Table, Input } from 'semantic-ui-react';

function ScanProducts() {
  //const [nutrientFacts, setNutrientFacts] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleFileUploadChange = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
    //generateNutrientFacts();
  };

  // const generateNutrientFacts = () => {
  //   const randomValues = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
  //   setNutrientFacts([
  //     { name: 'Calories', value: randomValues[0] },
  //     { name: 'Total Fat', value: randomValues[1] },
  //     { name: 'Saturated Fat', value: randomValues[2] },
  //     { name: 'Cholesterol', value: randomValues[3] },
  //     { name: 'Sodium', value: randomValues[4] },
  //   ]);
  // };

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
        // Handle unsuccessful prediction
        alert('Failed to classify image. Please try again.');
        console.log("no response")
      }
    } catch (error) {
      // Handle errors
      console.error('Error classifying image:', error.message);
      alert('Failed to classify image. An error occurred.');
    }
  };
  

  return (
    <Container text className="scan-products-container">
      <SubHeading text="Scan Products" />
      <div style={{ display: 'flex'}}>
        <Segment className="scan-products-segment" style={{ flex: '1 1 0px', margin: '20px' }}>
          <Input type="file" onChange={handleFileUploadChange} />
          <br />
          <button className="upload-button" onClick={handleImageUpload}>Upload Image</button>
          <br></br>
          {predictionResult && <h3>It is: {predictionResult}</h3>}
          {/* <Table celled className="nutrient-facts-table" style={{ flex: '0 0 300px' }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Nutrient</Table.HeaderCell>
                <Table.HeaderCell>Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {nutrientFacts.map((fact, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{fact.name}</Table.Cell>
                  <Table.Cell>{fact.value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table> */}
        </Segment>
      </div>
    </Container>
  );
}

export default ScanProducts;
