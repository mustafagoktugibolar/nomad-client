import React from "react";
import { Card } from "react-bootstrap";

const WorldMapTooltip = ({ popupInfo }) => {
  if (!popupInfo) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${popupInfo.lng}px`,
        top: `${popupInfo.lat}px`,
        transform: "translate(-50%, -100%)",
        zIndex: 1000,
      }}
    >
      <Card style={{ width: "200px", boxShadow: "0px 2px 5px rgba(0,0,0,0.3)" }}>
        <Card.Body>
          <Card.Title style={{ fontSize: "16px", fontWeight: "bold" }}>
            {popupInfo.name}
          </Card.Title>
          <Card.Text>
            🌍 Country Information:
            <br />
            Longitude: {popupInfo.lng}
            <br />
            Latitude: {popupInfo.lat}
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorldMapTooltip;
