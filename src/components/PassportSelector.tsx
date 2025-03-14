import React from "react";
import { Card, Form } from "react-bootstrap";

interface PassportSelectorProps {
  selectedCountry: string;
}

const PassportSelector: React.FC<PassportSelectorProps> = ({ selectedCountry }) => {
  return (
    <>
      <Card.Title className="fw-bold fs-5 mb-3">
        {selectedCountry} için pasaport seç
      </Card.Title>
      <Form.Select>
        <option>Normal Pasaport</option>
        <option>Yeşil Pasaport</option>
        <option>Hizmet Pasaportu</option>
        <option>Diplomatik Pasaport</option>
      </Form.Select>
    </>
  );
};

export default PassportSelector;
