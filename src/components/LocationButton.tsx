import React, { FC } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import LoadingSpinner from "./LoadingSpinner";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "./Button";

interface LocationButtonProps {
  latitude?: number;
  longitude?: number;
  loading: boolean;
}

const LocationButton: FC<LocationButtonProps> = ({
  latitude,
  longitude,
  loading,
}) => {
  if (latitude === undefined || longitude === undefined) {
    return <LoadingSpinner text="Cargando Mapa" isComponent={true} />;
  }

  const handleOpenInMaps = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const mapUrl = isMobile
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(mapUrl, "_blank");
  };

  const position: LatLngExpression = [latitude, longitude];

  const customIcon = L.divIcon({
    className: "text-xl",
    html: "<div>🥳</div>",
  });

  return (
    <div className="flex flex-col justify-center">
      <div className="h-48 mb-3">
        <MapContainer
          center={position}
          zoom={13}
          className="rounded-lg"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={customIcon}>
            <Popup>asd</Popup>
          </Marker>
        </MapContainer>
      </div>
      

      <Button text="Abrir en Maps" onClick={handleOpenInMaps}/>
    </div>
  );
};

export default LocationButton;
