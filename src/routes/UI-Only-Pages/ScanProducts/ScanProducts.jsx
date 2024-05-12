import React, { useState } from 'react';
import './ScanProducts.css'
import SubHeading from'../../../components/general_components/headings/SubHeading'
import { Button, Form, Container, Segment, Table, Message, Input } from 'semantic-ui-react'

function ScanProducts() {
  const [scannedProducts, setScannedProducts] = useState([]);
  const [nutrientFacts, setNutrientFacts] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleFileUploadChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
      generateNutrientFacts();
    };
    reader.readAsDataURL(file);
  };

  const generateNutrientFacts = () => {
    const randomValues = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
    setNutrientFacts([
      { name: 'Calories', value: randomValues[0] },
      { name: 'Total Fat', value: randomValues[1] },
      { name: 'Saturated Fat', value: randomValues[2] },
      { name: 'Cholesterol', value: randomValues[3] },
      { name: 'Sodium', value: randomValues[4] },
    ]);
  };

  return (
    <Container text className="scan-products-container">
      <SubHeading text="Scan Products" />
      <div style={{ display: 'flex' }}>
        <Segment className="scan-products-segment" style={{ flex: '1 1 0px', margin : '20 px' }}>

            <Input type="file" onChange={handleFileUploadChange} />
          <Table celled className="nutrient-facts-table" style={{ flex: '0 0 300px' }}>
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
        </Table>
        </Segment>

      </div>
    </Container>
  );
            }

export default ScanProducts;