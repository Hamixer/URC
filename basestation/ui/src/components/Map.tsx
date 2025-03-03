import React, { useState, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

//======================================================================
// Utility Function for Custom Icon
//======================================================================

const createCustomIcon = (rotationAngle: number) =>
  L.divIcon({
    html: `<img src="https://pngimg.com/d/triangle_PNG76.png" 
           style="transform: rotate(${rotationAngle}deg); width: 30px; height: 30px;" />`,
    className: "rover-icon",
    iconAnchor: [15, 15], // Adjust anchor so the tip aligns properly
  });

//======================================================================
// Type Definitions
//======================================================================

interface TrailPoint {
  position: [number, number];
  timestamp: number;
}

const CenterMap: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(position, { animate: true, duration: 0.5 }); // Center map on new position
  }, [map, position]);
  return null;
};

//======================================================================
// Main Map Component
//======================================================================

export const Map: React.FC<{ roverPosition?: [number, number] }> = ({
  roverPosition,
}) => {
  // State for Movement Tracking
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [compassAngle, setCompassAngle] = useState<number>(0);
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  //======================================================================
  // Add Rover's Position to Trail
  //=====================================================================

  useEffect(() => {
    if (roverPosition) {
      setTrail((prevTrail) => [
        ...prevTrail,
        { position: roverPosition, timestamp: Date.now() },
      ]);
    }
  }, [roverPosition]);

  //======================================================================
  // Remove Old Trail Points (Runs Every Second)
  //======================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setTrail((prevTrail) =>
        prevTrail.filter((point) => currentTime - point.timestamp <= 5000)
      );
    }, 1000); //  Runs every second

    return () => clearInterval(interval);
  }, []); //

  //======================================================================
  //  Calculate Rotation Angle Based on Movement Direction
  //======================================================================

  useEffect(() => {
    if (trail.length > 1) {
      const prevPosition = trail[trail.length - 2].position;
      const currentPosition = trail[trail.length - 1].position;

      const deltaX = currentPosition[1] - prevPosition[1]; // Longitude difference
      const deltaY = currentPosition[0] - prevPosition[0]; // Latitude difference

      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI; // Convert radians to degrees
      setCompassAngle(angle);
      setRotationAngle(angle);
    }
  }, [trail]);

  //======================================================================
  //  Render Map & Components
  //======================================================================

  return (
    <div
      className="w-80 h-80 rounded-[50%] flex items-center justify-center"
      style={{
        border: "7px solid teal",
        overflow: "hidden",
        background: "rgba(0, 0, 0, 0.6)",
        position: "relative",
      }}
    >
      {/* Cardinal Direction Markers */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none", // Prevents interaction blocking
          zIndex: 999,
        }}
      >
        {/* N (North) */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "16px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "'Monotype Corsiva', cursive", // Apply the font
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          N
        </div>

        {/* E (East) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "5px",
            transform: "translateY(-50%)",
            fontSize: "16px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "'Monotype Corsiva', cursive", // Apply the font
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          E
        </div>

        {/* S (South) */}
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "16px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "'Monotype Corsiva', cursive", // Apply the font
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          S
        </div>

        {/* W (West) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "5px",
            transform: "translateY(-50%)",
            fontSize: "16px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "'Monotype Corsiva', cursive", // Apply the font
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          W
        </div>
      </div>
      {roverPosition ? (
        <MapContainer
          center={roverPosition}
          zoom={22}
          style={{ height: "400px", width: "100%", backgroundColor: "#171717" }}
          scrollWheelZoom={false}
          dragging={false}
          worldCopyJump={false}
          zoomControl={false}
          keyboard={false}
          doubleClickZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Trail Path */}
          <Polyline
            positions={trail.map((point) => point.position)}
            color="blue"
            weight={4}
            opacity={0.8}
          />

          {/* Rover Position (Triangle Icon ) */}
          <Marker
            position={roverPosition}
            icon={createCustomIcon(rotationAngle)}
          />

          {/*  Center Map on Rover */}
          <CenterMap position={roverPosition} />
        </MapContainer>
      ) : (
        <p>No Data</p>
      )}
    </div>
  );
};
