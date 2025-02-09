import React from "react";
import { Card, Form } from "react-bootstrap";

const PassportSelector = ({ selectedCountry }) => {
  return (
    <>
      <Card.Title className="fw-bold fs-5 mb-3">{selectedCountry} için pasaport seç</Card.Title>
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
